import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Path, Text as KText, Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Type, ImagePlus, Trash2, Undo2, Check, Square, Circle as CircleIcon, Heart, RectangleHorizontal, LayoutTemplate, ChevronsUp, ChevronsDown, ChevronUp, ChevronDown } from "lucide-react";

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
const SHAPE_COLORS = ["#1A1A1A", "#FFFFFF", "#D4AF37", "#7A2E2E", "#5C7A3F", "#C07A65", "#7E5A39", "#B3A89B", "#F2CFC0", "#233520"];

// Heart SVG path (centred ~140×130 at scale 1)
const HEART_PATH = "M70,125 C25,90 0,60 0,35 C0,15 17,0 35,0 C50,0 62,8 70,22 C78,8 90,0 105,0 C123,0 140,15 140,35 C140,60 115,90 70,125 Z";

const SHAPE_KINDS = [
  { id: "rect-square",     label: "Square",        Icon: Square },
  { id: "rect-horizontal", label: "Rectangle",     Icon: RectangleHorizontal },
  { id: "circle",          label: "Circle",        Icon: CircleIcon },
  { id: "heart",           label: "Heart",         Icon: Heart },
];

function URLImage({ src, ...props }) {
  const [img] = useImage(src, "anonymous");
  if (!img) return null;
  return <KImage image={img} {...props} />;
}

let nextId = 1;
const uid = () => `n${nextId++}_${Date.now().toString(36)}`;

export default function BoxDesigner({ open, onClose, onSave, initialBg, templateMode = false, initialLayers = null, initialName = "", categories = [] }) {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const bgRectRef = useRef(null);

  const [bg, setBg] = useState(initialBg || "#F2EFEB");
  const [layers, setLayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [savingPng, setSavingPng] = useState(false);
  const [stageWidth, setStageWidth] = useState(BOX_W);

  // Templates picker
  const [tplOpen, setTplOpen] = useState(false);
  const [tplCats, setTplCats] = useState([]);
  const [tpls, setTpls] = useState([]);
  const [activeCat, setActiveCat] = useState("");

  // Template-mode metadata (admin)
  const [tplName, setTplName] = useState(initialName || "");
  const [tplCategoryId, setTplCategoryId] = useState(categories?.[0]?.id || "");

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setLayers([]);
      setHistory([]);
      setSelectedId(null);
      setTplOpen(false);
    } else {
      setBg(initialBg || "#F2EFEB");
      // Hydrate from initialLayers (used by template-mode editing or future "edit my saved design")
      if (initialLayers) setLayers(initialLayers);
      setTplName(initialName || "");
      if (categories?.[0]) setTplCategoryId(categories[0].id);
    }
  }, [open, initialBg, initialLayers, initialName, categories]);

  // Track container width so the canvas scales to fit (no overlap)
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const w = containerRef.current?.clientWidth || BOX_W;
      setStageWidth(Math.min(w, BOX_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [open]);

  const stageScale = stageWidth / BOX_W;
  const stageHeight = BOX_H * stageScale;

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

  const addShape = (kind) => {
    const id = uid();
    const base = { id, type: "shape", kind, x: 280, y: 200, fill: "#1A1A1A", rotation: 0, scaleX: 1, scaleY: 1 };
    let shape;
    switch (kind) {
      case "rect-square":     shape = { ...base, width: 220, height: 220 }; break;
      case "rect-horizontal": shape = { ...base, width: 280, height: 140 }; break;
      case "circle":          shape = { ...base, radius: 110 }; break;
      case "heart":           shape = { ...base }; break;
      default: return;
    }
    pushHistory([...layers, shape]);
    setSelectedId(id);
  };

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

  // Arrange layers (z-index = array order; later = on top)
  const moveLayer = (direction) => {
    if (!selectedId) return;
    const idx = layers.findIndex((l) => l.id === selectedId);
    if (idx === -1) return;
    let target;
    if (direction === "front") target = layers.length - 1;
    else if (direction === "back") target = 0;
    else if (direction === "forward") target = Math.min(layers.length - 1, idx + 1);
    else target = Math.max(0, idx - 1); // backward
    if (target === idx) return;
    const next = layers.slice();
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    pushHistory(next);
  };

  // Inline text editing — render an HTML textarea over the canvas
  const startEditingText = (layer) => {
    const stage = stageRef.current;
    if (!stage) return;
    const node = stage.findOne(`#${layer.id}`);
    if (!node) return;
    // Hide the konva text while editing so we don't see two overlapping
    node.hide();
    transformerRef.current?.hide();
    node.getLayer()?.batchDraw();

    const stageBox = stage.container().getBoundingClientRect();
    const absPos = node.getAbsolutePosition();
    const rotation = node.rotation();
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = layer.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${stageBox.top + absPos.y}px`;
    textarea.style.left = `${stageBox.left + absPos.x}px`;
    textarea.style.width = `${Math.max(160, node.width() * stageScale)}px`;
    textarea.style.minHeight = `${Math.max(40, layer.fontSize * (layer.scaleY || 1) * stageScale * 1.2)}px`;
    textarea.style.fontSize = `${layer.fontSize * (layer.scaleY || 1) * stageScale}px`;
    textarea.style.lineHeight = "1.1";
    textarea.style.fontFamily = layer.fontFamily;
    textarea.style.color = layer.fill;
    textarea.style.background = "rgba(255,255,255,0.96)";
    textarea.style.outline = "2px solid #1A1A1A";
    textarea.style.padding = "4px 6px";
    textarea.style.margin = "0";
    textarea.style.zIndex = "200";
    textarea.style.transformOrigin = "top left";
    textarea.style.transform = `rotate(${rotation}deg)`;
    textarea.style.overflow = "hidden";
    textarea.style.resize = "none";
    textarea.focus();
    textarea.select();

    const finish = (commit) => {
      const newText = textarea.value.trim() || layer.text;
      document.body.removeChild(textarea);
      node.show();
      transformerRef.current?.show();
      node.getLayer()?.batchDraw();
      if (commit) updateLayer(layer.id, { text: newText });
    };
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); finish(true); }
      if (e.key === "Escape") { e.preventDefault(); finish(false); }
    });
    textarea.addEventListener("blur", () => finish(true));
  };

  const handleSave = async () => {
    setSavingPng(true);
    try {
      const prevSelected = selectedId;
      setSelectedId(null);
      // Hide the bg rect so the PNG is transparent (studio-ready)
      bgRectRef.current?.hide();
      bgRectRef.current?.getLayer()?.batchDraw();
      await new Promise((r) => requestAnimationFrame(r));

      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 1.5 / stageScale,
        mimeType: "image/png", // transparent PNG
      });

      bgRectRef.current?.show();
      bgRectRef.current?.getLayer()?.batchDraw();

      const blob = await (await fetch(dataUrl)).blob();
      const fd = new FormData();
      fd.append("file", new File([blob], "design.png", { type: "image/png" }));
      const r = await axios.post(`${API_URL}/api/uploads/image`, fd);
      const previewUrl = `${API_URL}${r.data.url}`;

      if (templateMode) {
        if (!tplName.trim()) { toast.error("Template name required"); return; }
        if (!tplCategoryId) { toast.error("Pick a category"); return; }
        onSave?.({ name: tplName.trim(), category_id: tplCategoryId, thumbnail_url: previewUrl, layers });
      } else {
        onSave?.({ preview_url: previewUrl, background: bg, layers });
      }
      toast.success(templateMode ? "Template saved" : "Design saved");
      onClose?.();
      setSelectedId(prevSelected);
    } catch (err) {
      bgRectRef.current?.show();
      toast.error("Could not save design");
    } finally {
      setSavingPng(false);
    }
  };

  // Templates browser
  const openTemplates = async () => {
    setTplOpen(true);
    try {
      if (tplCats.length === 0) {
        const c = await axios.get(`${API_URL}/api/templates/categories`);
        setTplCats(c.data || []);
        if (c.data?.[0]) setActiveCat(c.data[0].id);
      }
    } catch { toast.error("Could not load templates"); }
  };

  useEffect(() => {
    if (!tplOpen || !activeCat) return;
    (async () => {
      try {
        const r = await axios.get(`${API_URL}/api/templates`, { params: { category_id: activeCat } });
        setTpls(r.data || []);
      } catch { /* ignore */ }
    })();
  }, [tplOpen, activeCat]);

  const applyTemplate = (tpl) => {
    const fresh = (tpl.layers || []).map((l) => ({ ...l, id: uid() }));
    pushHistory(fresh);
    setSelectedId(null);
    setTplOpen(false);
    toast.success(`${tpl.name} loaded`);
  };

  const selected = layers.find((l) => l.id === selectedId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto" data-testid="box-designer-overlay" onClick={onClose}>
      <div className="bg-[#FAFAF7] w-full md:max-w-[1100px] md:max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()} data-testid="box-designer">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-[#E5E5E5] bg-white">
          <div>
            <p className="accent-label text-[10px]">{templateMode ? "Admin · Template" : "Personalised box · +£9.99"}</p>
            <h3 className="font-heading text-lg md:text-2xl text-[#1A1A1A]">{templateMode ? "Design a template" : "Design your box"}</h3>
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

          <button onClick={openTemplates} className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[12px] uppercase tracking-[0.18em]" data-testid="designer-templates-btn">
            <LayoutTemplate size={14} /> Templates
          </button>

          <span className="hidden sm:inline-block w-px h-6 bg-[#E5E5E5] mx-1" />

          {/* Shape buttons */}
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A] mr-1 hidden sm:inline">Shape</span>
          {SHAPE_KINDS.map((s) => (
            <button
              key={s.id}
              onClick={() => addShape(s.id)}
              className="inline-flex items-center justify-center w-9 h-9 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[#1A1A1A]"
              title={s.label}
              data-testid={`designer-add-shape-${s.id}`}
              aria-label={`Add ${s.label.toLowerCase()}`}
            >
              <s.Icon size={14} />
            </button>
          ))}

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
          <div className="flex-1 min-w-0 flex justify-center" ref={containerRef}>
            <div className="bg-white shadow-[0_18px_50px_rgba(26,26,26,0.12)]" style={{ width: stageWidth, maxWidth: "100%" }}>
              <Stage
                ref={stageRef}
                width={stageWidth}
                height={stageHeight}
                scaleX={stageScale}
                scaleY={stageScale}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
              >
                <Layer>
                  <Rect ref={bgRectRef} x={0} y={0} width={BOX_W} height={BOX_H} fill={bg} listening={false} />
                  <Rect x={20} y={20} width={BOX_W - 40} height={BOX_H - 40} stroke="rgba(255,255,255,0.35)" dash={[6, 8]} listening={false} />

                  {layers.map((l) => {
                    const common = {
                      id: l.id,
                      x: l.x,
                      y: l.y,
                      rotation: l.rotation || 0,
                      scaleX: l.scaleX || 1,
                      scaleY: l.scaleY || 1,
                      draggable: true,
                      onClick: () => setSelectedId(l.id),
                      onTap: () => setSelectedId(l.id),
                      onDragEnd: (e) => updateLayer(l.id, { x: e.target.x(), y: e.target.y() }),
                      onTransformEnd: (e) => {
                        const node = e.target;
                        updateLayer(l.id, {
                          x: node.x(), y: node.y(),
                          scaleX: node.scaleX(), scaleY: node.scaleY(),
                          rotation: node.rotation(),
                        });
                      },
                    };
                    if (l.type === "text") {
                      return <KText key={l.id} {...common} text={l.text} fontSize={l.fontSize} fontFamily={l.fontFamily} fill={l.fill}
                        onDblClick={() => startEditingText(l)}
                        onDblTap={() => startEditingText(l)} />;
                    }
                    if (l.type === "image") {
                      return <URLImage key={l.id} {...common} src={l.url} width={l.width} height={l.height} />;
                    }
                    if (l.kind === "rect-square" || l.kind === "rect-horizontal") {
                      return <Rect key={l.id} {...common} width={l.width} height={l.height} fill={l.fill} cornerRadius={4} />;
                    }
                    if (l.kind === "circle") {
                      return <Circle key={l.id} {...common} radius={l.radius} fill={l.fill} />;
                    }
                    if (l.kind === "heart") {
                      return <Path key={l.id} {...common} data={HEART_PATH} fill={l.fill} />;
                    }
                    return null;
                  })}

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

          {/* Inspector */}
          <aside className="lg:w-72 shrink-0 bg-white border border-[#E5E5E5] p-5" data-testid="designer-inspector">
            <p className="accent-label mb-4"><span className="thin-rule" />Layer settings</p>
            {!selected && (
              <p className="font-body text-[12px] text-[#7A7A7A]">
                Tap any text or photo on the canvas to edit it. <strong>Double-tap text to rewrite it.</strong> Drag to move, corner handles to scale, top dot to rotate.
              </p>
            )}

            {selected && (
              <div className="mb-5 pb-5 border-b border-[#E5E5E5]" data-testid="designer-arrange-controls">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A] mb-2">Arrange</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => moveLayer("front")} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[11px] uppercase tracking-[0.18em]" data-testid="designer-bring-to-front" aria-label="Bring to front">
                    <ChevronsUp size={14} /> To front
                  </button>
                  <button type="button" onClick={() => moveLayer("forward")} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[11px] uppercase tracking-[0.18em]" data-testid="designer-bring-forward" aria-label="Bring forward">
                    <ChevronUp size={14} /> Forward
                  </button>
                  <button type="button" onClick={() => moveLayer("backward")} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[11px] uppercase tracking-[0.18em]" data-testid="designer-send-backward" aria-label="Send backward">
                    <ChevronDown size={14} /> Backward
                  </button>
                  <button type="button" onClick={() => moveLayer("back")} className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#E5E5E5] hover:border-[#1A1A1A] text-[11px] uppercase tracking-[0.18em]" data-testid="designer-send-to-back" aria-label="Send to back">
                    <ChevronsDown size={14} /> To back
                  </button>
                </div>
              </div>
            )}

            {selected && selected.type === "text" && (
              <div className="space-y-4 text-[#1A1A1A]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Text</label>
                    <button
                      type="button"
                      onClick={() => startEditingText(selected)}
                      className="text-[10px] uppercase tracking-[0.18em] underline text-[#1A1A1A]"
                      data-testid="designer-edit-text-inline"
                    >
                      Edit on canvas
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={selected.text}
                    onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                    className="mt-1 w-full border border-[#E5E5E5] p-2 text-sm focus:border-[#1A1A1A] outline-none rounded-none"
                    data-testid="designer-text-input"
                  />
                  <p className="text-[10px] text-[#7A7A7A] mt-1">Tip: double-click the text on the canvas to rewrite it inline.</p>
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

            {selected && selected.type === "shape" && (
              <div className="space-y-4 text-[#1A1A1A]" data-testid="designer-shape-inspector">
                <p className="font-body text-[11px] text-[#7A7A7A]">Drag to reposition, corner handles to scale, top dot to rotate.</p>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-[#7A7A7A]">Colour</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SHAPE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateLayer(selected.id, { fill: c })}
                        className={`w-7 h-7 rounded-full border ${selected.fill === c ? "ring-2 ring-[#1A1A1A] ring-offset-1" : "border-[#E5E5E5]"}`}
                        style={{ background: c }}
                        data-testid={`designer-shape-color-${c}`}
                        aria-label={`Shape colour ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="rounded-none w-full" onClick={deleteSelected} data-testid="designer-shape-remove">Remove shape</Button>
              </div>
            )}
          </aside>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-7 py-4 border-t border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          {templateMode ? (
            <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
              <Input
                placeholder="Template name"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                className="light-input rounded-none max-w-xs"
                data-testid="designer-template-name"
              />
              <select
                value={tplCategoryId}
                onChange={(e) => setTplCategoryId(e.target.value)}
                className="light-input rounded-none h-10 px-3 max-w-xs"
                data-testid="designer-template-category"
              >
                {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <p className="font-body text-[11px] text-[#7A7A7A]">Save sends your design to the studio. They&rsquo;ll match it as faithfully as our materials allow.</p>
          )}
          <Button onClick={handleSave} disabled={savingPng || layers.length === 0} className="btn-dark rounded-none" data-testid="designer-save">
            <Check size={14} className="mr-2" /> {savingPng ? "Saving…" : (templateMode ? "Save template" : "Save design")}
          </Button>
        </div>
      </div>

      {/* Templates picker */}
      {tplOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setTplOpen(false)} data-testid="designer-templates-modal">
          <div className="bg-white max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
              <div>
                <p className="accent-label text-[10px]">Curated</p>
                <h4 className="font-heading text-xl text-[#1A1A1A]">Pick a starting template</h4>
              </div>
              <button onClick={() => setTplOpen(false)} className="text-[#7A7A7A] hover:text-[#1A1A1A]" aria-label="Close templates"><X size={18} /></button>
            </div>
            <div className="px-5 pt-4 flex flex-wrap gap-2">
              {tplCats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] border ${activeCat === c.id ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]"}`}
                  data-testid={`tpl-cat-${c.slug}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="p-5 overflow-y-auto">
              {tpls.length === 0 ? (
                <p className="font-body text-sm text-[#7A7A7A]">No templates in this category yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tpls.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="text-left bg-white border border-[#E5E5E5] hover:border-[#1A1A1A] transition-colors"
                      data-testid={`tpl-${t.id}`}
                    >
                      <div className="aspect-[10/7] bg-[#F2EFEB] overflow-hidden">
                        {t.thumbnail_url ? (
                          <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#B3A89B] font-heading text-2xl italic">{t.name}</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-body text-[12px] text-[#1A1A1A]">{t.name}</p>
                        <p className="font-body text-[11px] text-[#7A7A7A]">{(t.layers || []).length} elements</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
