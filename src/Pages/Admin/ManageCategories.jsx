import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../Components/Admin/AdminLayout";
import {
  getQACategories,
  createQACategory,
  updateQACategory,
  toggleQACategory,
  getQuestionsForCategory,
  updateQuestionsForCategory,
  deleteQACategory,
} from "../../api/qaCategories";
import {
  FolderTree,
  Plus,
  Pencil,
  Power,
  Save,
  X,
  Languages,
  ListChecks,
  ChevronRight,
  ChevronDown,
  Trash2,
} from "lucide-react";

function flattenCategories(categories, level = 0) {
  return categories.flatMap((cat) => [
    {
      ...cat,
      level,
      displayName: `${"— ".repeat(level)}${cat.name}`,
    },
    ...flattenCategories(cat.children || [], level + 1),
  ]);
}

// ── Category Tree Item ──────────────────────────────────────────────────────
function CategoryTreeItem({
  cat,
  collapsedIds,
  onToggleCollapse,
  onEdit,
  onRequestToggle,
  onAssignQuestions,
  onDelete,
}) {
  const hasChildren = (cat.children || []).length > 0;
  const isCollapsed = collapsedIds.has(cat._id);
  const questionCount = cat.questionCount || 0;

  // Cap indent so deep nesting doesn't push content off-screen on mobile
  const indent = Math.min(cat.level, 4) * 16;

  return (
    <div className="mb-2">
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-3 sm:px-4 py-3 ${
          cat.isActive === false
            ? "bg-slate-50 border-slate-200 opacity-60"
            : "bg-white border-slate-200"
        }`}
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="min-w-0 flex items-start gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleCollapse(cat._id)}
              className="mt-0.5 p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          ) : (
            <span className="w-[22px] shrink-0" />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="m-0 font-bold text-slate-800 break-words">
                {cat.name}
              </p>

              {cat.parent && (
                <span className="text-[0.7rem] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                  Sub Category
                </span>
              )}

              {hasChildren && (
                <span className="text-[0.7rem] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                  {cat.children.length} sub{cat.children.length > 1 ? "s" : ""}
                </span>
              )}

              <span
                className={`text-[0.7rem] rounded-full px-2 py-0.5 border whitespace-nowrap ${
                  questionCount > 0
                    ? "bg-[rgba(40,115,70,0.08)] text-[var(--bg-color-header)] border-[rgba(40,115,70,0.2)]"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
                title="Questions assigned to this category"
              >
                {questionCount} question{questionCount === 1 ? "" : "s"}
              </span>

              {cat.isActive === false && (
                <span className="text-[0.7rem] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                  Inactive
                </span>
              )}
            </div>

            <p className="m-0 mt-1 text-xs text-slate-400 break-all">
              {cat.path}
            </p>

            {cat.description && (
              <p className="m-0 mt-1 text-sm text-slate-500 break-words">
                {cat.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
          <button
            type="button"
            onClick={() => onEdit(cat)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onAssignQuestions(cat)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm font-semibold whitespace-nowrap"
            title="Assign questions"
          >
            <ListChecks size={16} className="shrink-0" />
            <span className="hidden xs:inline sm:inline">Assign Questions</span>
            <span className="inline xs:hidden sm:hidden">Assign</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs sm:text-sm font-semibold whitespace-nowrap"
            title="Delete permanently"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => onRequestToggle(cat)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap ${
              cat.isActive === false
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title={cat.isActive === false ? "Activate" : "Deactivate"}
          >
            <Power size={16} className="shrink-0" />
            {cat.isActive === false ? "Activate" : "Deactivate"}
          </button>
        </div>
      </div>

      {hasChildren &&
        !isCollapsed &&
        cat.children.map((child) => (
          <CategoryTreeItem
            key={child._id}
            cat={{ ...child, level: (cat.level || 0) + 1 }}
            collapsedIds={collapsedIds}
            onToggleCollapse={onToggleCollapse}
            onEdit={onEdit}
            onRequestToggle={onRequestToggle}
            onAssignQuestions={onAssignQuestions}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

// ── Assign Questions Modal ──────────────────────────────────────────────────
function AssignQuestionsModal({ category, onClose, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);

    getQuestionsForCategory(category._id)
      .then((data) => {
        setQuestions(data.questions || []);

        setChecked(
          new Set(
            (data.questions || [])
              .filter((q) => q.selected)
              .map((q) => String(q._id)),
          ),
        );
      })
      .catch((err) => {
        setMsg(err.message || "Could not load questions.");
      })
      .finally(() => setLoading(false));
  }, [category._id]);

  const toggleQuestion = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const filteredQuestions = questions.filter((q) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      q.heading?.toLowerCase().includes(term) ||
      q.slug?.toLowerCase().includes(term)
    );
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg("");

      await updateQuestionsForCategory(category._id, [...checked]);

      onSaved?.();
      onClose();
    } catch (err) {
      setMsg(err.message || "Could not save assigned questions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-w-[96vw] max-h-[88vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 m-0">
            Assign Questions
          </h3>

          <p className="text-sm text-slate-500 mt-1 mb-0">
            Category:{" "}
            <span className="font-semibold text-[#c3a421]">
              {category.name}
            </span>
          </p>

          <p className="text-xs text-slate-400 mt-1 mb-4">
            {category.lang === "ar" ? "Arabic" : "English"} questions only
          </p>

          {msg && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">
              {msg}
            </div>
          )}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title or slug..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421]"
          />

          <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
            <span>{checked.size} selected</span>
            <span>{filteredQuestions.length} shown</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No questions found.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuestions.map((q) => {
                const id = String(q._id);
                const selected = checked.has(id);

                return (
                  <label
                    key={q._id}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                      selected
                        ? "bg-[rgba(40,115,70,0.06)] border-[var(--bg-color-header)]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleQuestion(id)}
                      className="mt-1 accent-[var(--bg-color-header)] w-4 h-4 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="m-0 font-semibold text-slate-700 leading-snug">
                        {q.heading}
                      </p>
                      <p className="m-0 mt-1 text-xs text-slate-400 break-all">
                        {q.slug}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[var(--bg-color-header)] text-white font-bold disabled:opacity-60"
          >
            {saving ? "Saving..." : `Save (${checked.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Category Modal ─────────────────────────────────────────────────────
function EditCategoryModal({ category, parentOptions, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category.name || "",
    parent: category.parent?._id || category.parent || "",
    description: category.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name.trim()) {
      setMsg("Please enter a category name.");
      return;
    }

    try {
      setSaving(true);
      await updateQACategory(category._id, {
        name: form.name,
        parent: form.parent || null,
        description: form.description,
        isActive: category.isActive !== false,
      });
      onSaved();
      onClose();
    } catch (err) {
      setMsg(err.message || "Could not update category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw] p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
            <Pencil size={19} className="text-[#c3a421]" />
            Edit Category
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {msg && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            dir={category.lang === "ar" ? "rtl" : "ltr"}
            className={`w-full mb-4 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] ${
              category.lang === "ar" ? "text-right" : "text-left"
            }`}
          />

          <label className="block text-sm font-bold text-slate-700 mb-1">
            Parent Category
          </label>
          <select
            value={form.parent}
            onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
            className="w-full mb-4 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] bg-white"
          >
            <option value="">No parent — top level</option>
            {parentOptions
              .filter((cat) => cat._id !== category._id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.displayName}
                </option>
              ))}
          </select>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((p) => ({ ...p, order: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--bg-color-header)] text-white font-bold disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmDeleteModal({ category, onConfirm, onClose, deleting }) {
  const hasChildren = (category.children || []).length > 0;
  const questionCount = category.questionCount || 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] max-w-[95vw] p-7 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Delete "{category.name}" permanently?
        </h3>

        <p className="text-slate-600 text-[0.95rem] leading-relaxed mb-3">
          This cannot be undone. The category will be removed from any questions
          it's assigned to.
        </p>

        {hasChildren && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm mb-2 text-left">
            This category has {category.children.length} subcategor
            {category.children.length > 1 ? "ies" : "y"} nested under it. Delete{" "}
            {category.children.length > 1 ? "them" : "it"} first, or edit{" "}
            {category.children.length > 1 ? "each one's" : "its"} parent to
            reassign {category.children.length > 1 ? "them" : "it"} elsewhere.
          </p>
        )}

        {!hasChildren && questionCount > 0 && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm mb-2 text-left">
            {questionCount} question{questionCount > 1 ? "s are" : " is"}{" "}
            currently assigned to this category and will lose this assignment.
          </p>
        )}

        <div className="flex gap-3 justify-center mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting || hasChildren}
            className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Confirm Deactivate Modal ────────────────────────────────────────────────
function ConfirmDeactivateModal({ category, onConfirm, onClose, confirming }) {
  const hasChildren = (category.children || []).length > 0;
  const questionCount = category.questionCount || 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] max-w-[95vw] p-7 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Power size={24} />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Deactivate "{category.name}"?
        </h3>

        <p className="text-slate-600 text-[0.95rem] leading-relaxed mb-3">
          It will be hidden from Add Q&amp;A and public category listings until
          reactivated.
        </p>

        {questionCount > 0 && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm mb-2 text-left">
            {questionCount} question{questionCount > 1 ? "s are" : " is"}{" "}
            currently assigned to this category.
          </p>
        )}

        {hasChildren && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm mb-2 text-left">
            This category has {category.children.length} subcategor
            {category.children.length > 1 ? "ies" : "y"} nested under it.
          </p>
        )}

        <div className="flex gap-3 justify-center mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
          >
            {confirming ? "Deactivating..." : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ManageQACategories() {
  const [lang, setLang] = useState("en");
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [assignCategory, setAssignCategory] = useState(null);
  const [confirmToggleCat, setConfirmToggleCat] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());
  const [form, setForm] = useState({
    name: "",
    parent: "",
    description: "",
    order: 0,
  });

  const flatCategories = useMemo(
    () => flattenCategories(categoriesTree),
    [categoriesTree],
  );

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getQACategories(lang, true, true);
      setCategoriesTree(data);
    } catch (err) {
      setMsg(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resetForm();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  useEffect(() => {
    if (!msg) return;

    const timer = setTimeout(() => setMsg(""), 4000);

    return () => clearTimeout(timer);
  }, [msg]);
  const resetForm = () => {
    setForm({
      name: "",
      parent: "",
      description: "",
    });
  };

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
  };
  const handleDelete = (cat) => {
    setConfirmDeleteCat(cat);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteCat) return;

    try {
      setDeleting(true);
      setMsg("");
      await deleteQACategory(confirmDeleteCat._id);
      setMsg("Category deleted successfully.");
      setConfirmDeleteCat(null);
      await loadCategories();
    } catch (err) {
      setMsg(err.message || "Could not delete category.");
      setConfirmDeleteCat(null);
    } finally {
      setDeleting(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name.trim()) {
      setMsg("Please enter a category name.");
      return;
    }

    try {
      await createQACategory({
        name: form.name,
        lang,
        parent: form.parent || null,
        description: form.description,
      });
      setMsg("Category created successfully.");
      resetForm();
      await loadCategories();
    } catch (err) {
      setMsg(err.message || "Could not save category.");
    }
  };

  const performToggle = async (id) => {
    try {
      await toggleQACategory(id);
      await loadCategories();
    } catch (err) {
      setMsg(err.message || "Could not update category.");
    }
  };

  // Activating needs no confirmation; deactivating opens the confirm modal.
  const requestToggle = (cat) => {
    if (cat.isActive === false) {
      performToggle(cat._id);
    } else {
      setConfirmToggleCat(cat);
    }
  };

  const confirmDeactivate = async () => {
    if (!confirmToggleCat) return;
    setConfirming(true);
    await performToggle(confirmToggleCat._id);
    setConfirming(false);
    setConfirmToggleCat(null);
  };

  const parentOptions = flatCategories;

  return (
    <AdminLayout>
      <div className="max-w-[980px] mx-auto mt-10 px-4">
        <div className="mb-6">
          <h1 className="text-[1.85rem] font-bold text-slate-800 m-0 flex items-center gap-2.5">
            <FolderTree size={27} className="text-[#c3a421]" />
            Q&amp;A Categories
          </h1>
          <p className="text-[0.95rem] text-slate-500 mt-1 mb-0">
            Create, edit, and organize nested categories for published answers.
          </p>
        </div>

        {assignCategory && (
          <AssignQuestionsModal
            category={assignCategory}
            onClose={() => setAssignCategory(null)}
            onSaved={loadCategories}
          />
        )}

        {editingCategory && (
          <EditCategoryModal
            category={editingCategory}
            parentOptions={flatCategories}
            onClose={() => setEditingCategory(null)}
            onSaved={loadCategories}
          />
        )}

        {confirmToggleCat && (
          <ConfirmDeactivateModal
            category={confirmToggleCat}
            confirming={confirming}
            onConfirm={confirmDeactivate}
            onClose={() => setConfirmToggleCat(null)}
          />
        )}
        {confirmDeleteCat && (
          <ConfirmDeleteModal
            category={confirmDeleteCat}
            deleting={deleting}
            onConfirm={confirmDelete}
            onClose={() => setConfirmDeleteCat(null)}
          />
        )}
        {msg && (
          <div
            className={`mb-5 px-4 py-2.5 rounded-xl text-[0.9rem] font-medium ${
              msg.toLowerCase().includes("failed") ||
              msg.toLowerCase().includes("could") ||
              msg.toLowerCase().includes("please")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1.5 mb-6 max-w-[360px]">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`flex-1 px-4 py-2.5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer flex items-center justify-center gap-2 transition-all ${
              lang === "en"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Languages size={16} />
            English
          </button>

          <button
            type="button"
            onClick={() => setLang("ar")}
            className={`flex-1 px-4 py-2.5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer flex items-center justify-center gap-2 transition-all ${
              lang === "ar"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            العربية
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="m-0 text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus size={20} className="text-[#c3a421]" />
              Create Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={lang === "ar" ? "مثال: الصلاة" : "Example: Prayer"}
                dir={lang === "ar" ? "rtl" : "ltr"}
                className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] ${
                  lang === "ar" ? "text-right" : "text-left"
                }`}
              />
              <p className="text-xs text-slate-400 mt-1 mb-0">
                Slug is created automatically.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Parent Category
              </label>
              <select
                value={form.parent}
                onChange={(e) =>
                  setForm((p) => ({ ...p, parent: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] bg-white"
              >
                <option value="">No parent — top level</option>
                {parentOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1 mb-0">
                Select a parent to create a nested category.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 flex items-center justify-center gap-2 bg-[var(--bg-color-header)] text-white rounded-xl px-5 py-3 font-bold hover:opacity-90"
          >
            <Save size={17} />
            Create Category
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="m-0 text-xl font-bold text-slate-800">
              Existing Categories
            </h2>
            <span className="bg-slate-100 text-slate-500 text-[0.8rem] font-semibold px-2.5 py-1 rounded-full">
              {flatCategories.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : flatCategories.length === 0 ? (
            <div className="text-center py-12 px-6 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No categories found. Create your first category above.
            </div>
          ) : (
            <div>
              {categoriesTree.map((cat) => (
                <CategoryTreeItem
                  key={cat._id}
                  cat={{ ...cat, level: 0 }}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={toggleCollapse}
                  onEdit={handleEdit}
                  onRequestToggle={requestToggle}
                  onAssignQuestions={setAssignCategory}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
