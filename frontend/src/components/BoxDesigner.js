import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text as KText, Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, Type, ImagePlus, Trash2, Undo2, Check, Palette } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BOX_W = 800;
const BOX_H = 560;

const FONT_OPTIONS = [
  { id: "Cormorant Garamond, serif", label: "Cormorant (serif)" },
  { id: "Inter, sans-serif", label: "Inter (sans)" },
  { id: "Playfair Display, serif", label: "Playfair (display)" },
  { id: "Dancing Script, cursive", label: "Dancing Script (script)" },
  { id: "Courier New, monospace", label: "Courier (mono)" },
  { id: "Georgia, serif", label: "Georgia" },
];

const TEXT_COLORS = ["#1A1A1A", "#FFFFFF", "#B3A89B", "#C07A65", "#5C7A3F", "#7E5A39", "#D4AF37", "#7A2E2E"];
const BG_COLORS  = ["#F2EFEB", "#FAFAF7", "#1A1A1A", "#C9A66B", "#E8ECE1", "#F2CFC0", "#233520", "#FFFFFF"];

function URLImage({ src, ...props }) {
  const [img] = useImage(src, "anonymous");
  if (!img) return null;
  return <KImage image={img} {...props} />;
}

let nextId = 1;
const uid = () => `n${nextId++}_${Date.now().toString(36)}`;

export default function BoxDesigner({ open, onClose, onSave, initialBg }) {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [bg, setBg] = useState(initialBg || "#F2EFEB");
  const [layers, setLayers] = useState([]);  // [{id,type:"text"|"image",...}]
  const [history, setHistory] = useState([]); // for undo
  const [selectedId, setSelectedId] = useState(null);
  const [savingPng, setSavingPng] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setLayers([]);
      setHistory([]);
      setSelectedId(null);
      setBg(initialBg || "#F2EFEB");
    }
  }, [open, initialBg]);

  // Attach transformer to selected node
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`);
      if (node) {
        tr.nodes([node]);
        tr.getLayer().batchDraw();
      } else {
        tr.nodes([]);
      }
    } else {
      tr.nodes([]);
    }
  }, [selectedId, layers]);

  const pushHistory = (next) => {
    setHistory((h) => [...h, layers]);
    setLayers(next);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setLayers(prev);
      setSelectedId(null);
      return h.slice(0, -1);
    });
  };

  const addText = () => {
    const id = uid();
    pushHistory([
      ...layers,
      { id, type: "text", text: "Your message", x: 200, y: 220, fontSize: 48, fontFamily: FONT_OPTIONS[0].id, fill: "#1A1A1A", rotation: 0 },
    ]);
    setSelectedId(id);
  };

  const addImage = () => fileInputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { toast.error("Image must be under 6 MB"); return; }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await axios.post(`${API_URL}/api/uploads/image`, fd);
      const url = `${API_URL}${r.data.url}`;
      const id = uid();
      pushHistory([...layers, { id, type: "image", url, x: 250, y: 150, width: 280, height: 280, rotation: 0 }]);
      setSelectedId(id);
    } catch {
      toast.error("Upload failed");
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    pushHistory(layers.filter((l) => l.id !== selectedId));
    setSelectedId(null);
  };

  const updateLayer = (id, patch) => {
    setLayers((arr) => arr.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handleSave = async () => {
    setSavingPng(true);
    try {
      // Deselect so transformer handles aren't in the export
      const prevSelected = selectedId;
      setSelectedId(null);
      await new Promise((r) => requestAnimationFrame(r));
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1.5, mimeType: "image/jpeg", quality: 0.85 });
      // Convert dataURL to file & upload
      const blob = await (await fetch(dataUrl)).blob();
      const fd = new FormData();
      fd.append("file", new File([blob], "design.jpg", { type: "image/jpeg" }));
      const r = await axios.post(`${API_URL}/api/uploads/image`, fd);
      const previewUrl = `${API_URL}${r.data.url}`;
      onSave?.({
        preview_url: previewUrl,
        background: bg,
        layers,
      });
      toast.success("Design saved");
      onClose?.();
      setSelectedId(prevSelected);
    } catch (err) {
      toast.error("Could not save design");
    } finally {
      setSavingPng(false);
    }
  };

  const selected = layers.find((l) => l.id === selectedId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" data-testid="box-designer-overlay" onClick={onClose}>
      <div className="bg-[#FAFAF7] w-full md:max-w-[1100px] md:max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()} data-testid="box-designer">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-[#E5E5E5] bg-white">
          <div>
            <p className="accent-label text-[10px]">Personalised box · +£9.99</p>
            <h3 className="font-heading text-lg md:text-2xl text-[#1A1A1A]">Design your box</h3>
          </div>
          <button onClick={onClose} aria-label="Close" data-testid="box-designer-close" className="text-[#7A7A7A] hover:text-[#1A1A1A]">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 md:px-7 py-3 border-b border-[#E5E5E5] flex flex-wrap items-center gap-2 bg-white">
          <button onClick={addText} className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[12px] uppercase tracking-[0.18em]" data-testid="designer-add-text">
            <Type size={14} /> Add text
          </button>
          <button onClick={addImage} className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[12px] uppercase tracking-[0.18em]" data-testid="designer-add-image">
            <ImagePlus size={14} /> Add photo
          </button>
          <input type="file" accept="image/*" onChange={onFile} ref={fileInputRef} className="hidden" data-testid="designer-file-input" />

          <span className="hidden sm:inline-block w-px h-6 bg-[#E5E5E5] mx-1" />

          {/* Background colour */}
          <div className="inline-flex items-center gap-2">
            <Palette size={14} className="text-[#7A7A7A]" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A] mr-1">BG</span>
            {BG_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setBg(c)} className={`w-6 h-6 rounded-full border ${bg === c ? "ring-2 ring-[#1A1A1A] ring-offset-1" : "border-[#E5E5E5]"}`} style={{ background: c }} aria-label={`Background ${c}`} data-testid={`designer-bg-${c}`} />
            ))}
          </div>

          <span className="hidden sm:inline-block w-px h-6 bg-[#E5E5E5] mx-1" />

          <button onClick={undo} disabled={history.length === 0} className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] disabled:opacity-40 text-[12px] uppercase tracking-[0.18em]" data-testid="designer-undo">
            <Undo2 size={14} /> Undo
          </button>
          <button onClick={deleteSelected} disabled={!selectedId} className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-red-500 hover:text-red-500 disabled:opacity-40 text-[12px] uppercase tracking-[0.18em]" data-testid="designer-delete">
            <Trash2 size={14} /> Delete
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 md:p-7 flex flex-col lg:flex-row gap-5">
          {/* Canvas wrapper */}
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="bg-white shadow-[0_18px_50px_rgba(26,26,26,0.12)]" style={{ maxWidth: BOX_W, width: "100%" }}>
              <div style={{ width: "100%", aspectRatio: `${BOX_W} / ${BOX_H}` }}>
                <Stage
                  ref={stageRef}
                  width={BOX_W}
                  height={BOX_H}
                  onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                  onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                  style={{ width: "100%", height: "100%" }}
                  scale={{ x: 1, y: 1 }}
                >
                  <Layer>
                    <Rect x={0} y={0} width={BOX_W} height={BOX_H} fill={bg} />
                    {/* Subtle box edge */}
                    <Rect x={20} y={20} width={BOX_W - 40} height={BOX_H - 40} stroke="rgba(26,26,26,0.10)" dash={[6, 8]} listening={false} />

                    {layers.map((l) => l.type === "text" ? (
                      <KText
                        key={l.id}
                        id={l.id}
                        text={l.text}
                        x={l.x}
                        y={l.y}
                        fontSize={l.fontSize}
                        fontFamily={l.fontFamily}
                        fill={l.fill}
                        rotation={l.rotation || 0}
                        scaleX={l.scaleX || 1}
                        scaleY={l.scaleY || 1}
                        draggable
                        onClick={() => setSelectedId(l.id)}
                        onTap={() => setSelectedId(l.id)}
                        onDragEnd={(e) => updateLayer(l.id, { x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          updateLayer(l.id, {
                            x: node.x(), y: node.y(),
                            scaleX: node.scaleX(), scaleY: node.scaleY(),
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    ) : (
                      <URLImage
                        key={l.id}
                        id={l.id}
                        src={l.url}
                        x={l.x}
                        y={l.y}
                        width={l.width}
                        height={l.height}
                        rotation={l.rotation || 0}
                        scaleX={l.scaleX || 1}
                        scaleY={l.scaleY || 1}
                        draggable
                        onClick={() => setSelectedId(l.id)}
                        onTap={() => setSelectedId(l.id)}
                        onDragEnd={(e) => updateLayer(l.id, { x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          updateLayer(l.id, {
                            x: node.x(), y: node.y(),
                            scaleX: node.scaleX(), scaleY: node.scaleY(),
                            rotation: node.rotation(),
                          });
                        }}
                      />
                    ))}

                    <Transformer
                      ref={transformerRef}
                      rotateEnabled
                      keepRatio={false}
                      boundBoxFunc={(oldB, newB) => (newB.width < 12 || newB.height < 12 ? oldB : newB)}
                    />
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          {/* Inspector */}
          <aside className="lg:w-72 shrink-0 bg-white border border-[#E5E5E5] p-5" data-testid="designer-inspector">
            <p className="accent-label mb-4"><span className="thin-rule" />Layer settings</p>
            {!selected && (
              <p className="font-body text-[12px] text-[#7A7A7A]">
                Tap any text or photo on the canvas to edit it. Drag to move, corner handles to scale, top dot to rotate.
              </p>
            )}

            {selected && selected.type === "text" && (
              <div className="space-y-4 text-[#1A1A1A]">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Text</label>
                  <textarea
                    rows={2}
                    value={selected.text}
                    onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                    className="mt-1 w-full border border-[#E5E5E5] p-2 text-sm focus:border-[#1A1A1A] outline-none rounded-none"
                    data-testid="designer-text-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Font</label>
                  <select
                    value={selected.fontFamily}
                    onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
                    className="mt-1 w-full border border-[#E5E5E5] p-2 text-sm rounded-none"
                    data-testid="designer-font-select"
                  >
                    {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Size {Math.round(selected.fontSize)}px</label>
                  <input
                    type="range"
                    min="14"
                    max="160"
                    value={selected.fontSize}
                    onChange={(e) => updateLayer(selected.id, { fontSize: parseInt(e.target.value, 10) })}
                    className="w-full"
                    data-testid="designer-font-size"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Colour</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateLayer(selected.id, { fill: c })}
                        className={`w-7 h-7 rounded-full border ${selected.fill === c ? "ring-2 ring-[#1A1A1A] ring-offset-1" : "border-[#E5E5E5]"}`}
                        style={{ background: c }}
                        data-testid={`designer-text-color-${c}`}
                        aria-label={`Text colour ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selected && selected.type === "image" && (
              <div className="space-y-3 text-[#1A1A1A]">
                <p className="font-body text-[11px] text-[#7A7A7A]">Drag to reposition, corner handles to scale, top dot to rotate.</p>
                <Button variant="outline" className="rounded-none w-full" onClick={deleteSelected} data-testid="designer-image-remove">Remove photo</Button>
              </div>
            )}
          </aside>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-7 py-4 border-t border-[#E5E5E5] flex items-center justify-between bg-white">
          <p className="font-body text-[11px] text-[#7A7A7A]">Save sends your design to the studio. They&rsquo;ll match it as faithfully as our materials allow.</p>
          <Button onClick={handleSave} disabled={savingPng || layers.length === 0} className="btn-dark rounded-none" data-testid="designer-save">
            <Check size={14} className="mr-2" /> {savingPng ? "Saving…" : "Save design"}
          </Button>
        </div>
      </div>
    </div>
  );
}
