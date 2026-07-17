import React, { useState, useEffect } from "react";
import {
  fetchBooksAdmin,
  deleteBookAdmin,
  reorderBooksAdmin,
} from "../../api/adminBook";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../Components/Admin/AdminLayout";
import { API_BASE } from "../../../config";

const LIMIT = 20;

export default function AllBooks({ lang = "en" }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onYes: null,
  });

  const [moveModal, setMoveModal] = useState({
    show: false,
    book: null,
    newOrder: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length === 0 || search.trim().length >= 3) {
        setDebouncedSearch(search.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setBooks([]);
  }, [lang, debouncedSearch]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        page === 1 ? setLoading(true) : setLoadingMore(true);

        const data = await fetchBooksAdmin(lang, page, LIMIT, debouncedSearch);

        setBooks((prev) =>
          page === 1 ? data.books : [...prev, ...data.books],
        );

        setHasMore(data.hasMore);
      } catch (err) {
        setModal({
          show: true,
          title: "Error",
          message: err.message,
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadBooks();
  }, [lang, page, debouncedSearch]);

  const refreshBooks = async () => {
    const data = await fetchBooksAdmin(lang, 1, LIMIT, debouncedSearch);
    setBooks(data.books);
    setHasMore(data.hasMore);
    setPage(1);
  };

  const openMoveModal = (book) => {
    setMoveModal({
      show: true,
      book,
      newOrder: "",
    });
  };

  const closeMoveModal = () => {
    setMoveModal({
      show: false,
      book: null,
      newOrder: "",
    });
  };

  const handleMovePosition = async () => {
    if (!moveModal.book) return;

    const parsedOrder = Number(moveModal.newOrder);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setModal({
        show: true,
        title: "Invalid Position",
        message: "Please enter a valid position number.",
      });
      return;
    }

    setUpdatingOrder(true);

    try {
      await reorderBooksAdmin(lang, moveModal.book._id, parsedOrder);
      await refreshBooks();

      closeMoveModal();

      setModal({
        show: true,
        title: "Position Updated",
        message: "Book position has been updated successfully.",
      });
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message || "Failed to update book position.",
      });
    } finally {
      setUpdatingOrder(false);
    }
  };

  const confirmDelete = (slug) => {
    setModal({
      show: true,
      title: "Delete Book",
      message: "Are you sure you want to delete this book?",
      onYes: () => doDelete(slug),
    });
  };

  const doDelete = async (slug) => {
    setModal({ show: false });
    setLoading(true);

    try {
      await deleteBookAdmin(lang, slug);
      setBooks((prev) => prev.filter((b) => b.slug !== slug));
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message,
      });
    }

    setLoading(false);
  };

  const handleAddDownloadLink = async (bookId) => {
    const driveLink = prompt("Paste the Google Drive link here:");

    if (!driveLink) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/books/admin/${bookId}/download`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driveLink }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add link");
      }

      alert("Download link updated successfully!");

      setBooks((prev) =>
        prev.map((b) =>
          b._id === bookId ? { ...b, download: data.download } : b,
        ),
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
        }
      `}</style>

      <div className="max-w-[900px] mx-auto mt-8">
        <h1 className="text-center text-[#c3a421] text-2xl font-bold mb-0">
          {lang === "ar" ? "Manage Arabic Books" : "Manage English Books"}
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-4">
          Search books, edit details, add download links, or update book order.
        </p>

        <div className="flex justify-center mt-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === "ar"
                ? "Search Arabic books..."
                : "Search English books..."
            }
            className="w-full max-w-[420px] bg-white border border-slate-300 rounded-[6px] py-2 px-4 text-base outline-none shadow-sm focus:border-[#c3a421]"
          />
        </div>

        {updatingOrder && (
          <div className="text-center text-blue-600 font-semibold mb-4">
            Updating position...
          </div>
        )}

        {loading ? (
          <div className="text-center">Loading books...</div>
        ) : (
          <>
            <ul className="list-none p-0 max-w-[840px] mx-auto">
              {books.length === 0 ? (
                <li>
                  No books found in {lang === "en" ? "English" : "Arabic"}.
                </li>
              ) : (
                books.map((book) => (
                  <li
                    key={book._id}
                    className="bg-white my-3 p-4 border-l-[5px] border-[#c3a421] rounded-[6px] flex justify-between items-center gap-4 transition-all duration-150 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="bg-slate-100 text-slate-700 py-1 px-2 rounded-full text-xs font-bold min-w-7 text-center">
                        {book.order || "-"}
                      </span>

                      <span
                        onClick={() =>
                          navigate(
                            `/library/read/${book.language}/${book.slug}`,
                          )
                        }
                        className="cursor-pointer text-[#1e293b] font-medium hover:underline"
                      >
                        {book.title}
                      </span>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        className="py-[0.4rem] px-[0.8rem] border-none rounded cursor-pointer text-[0.95rem] text-white bg-[#c3a421] disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => openMoveModal(book)}
                        disabled={updatingOrder}
                      >
                        Move Position
                      </button>

                      <button
                        className="py-[0.4rem] px-[0.8rem] border-none rounded cursor-pointer text-[0.95rem] text-white bg-[#2563eb] disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => handleAddDownloadLink(book._id)}
                        disabled={updatingOrder}
                      >
                        Add Download Link
                      </button>

                      <button
                        className="py-[0.4rem] px-[0.8rem] border-none rounded cursor-pointer text-[0.95rem] text-white bg-gray-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() =>
                          navigate(`/books/edit/${book.language}/${book.slug}`)
                        }
                        disabled={updatingOrder}
                      >
                        Edit
                      </button>

                      <button
                        className="py-[0.4rem] px-[0.8rem] border-none rounded cursor-pointer text-[0.95rem] text-white bg-[#e53e3e] disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => confirmDelete(book.slug)}
                        disabled={updatingOrder}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {hasMore && (
              <div className="flex justify-center mt-6 mb-10">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loadingMore || updatingOrder}
                  className="bg-[#c3a421] text-white py-2 px-6 rounded-[5px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "View More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {moveModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9998] px-4">
          <div className="bg-white w-full max-w-[420px] rounded-lg shadow-lg p-6 text-[#1e293b]">
            <h2 className="text-xl font-bold text-[#c3a421] mb-2">
              Move Book Position
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              Enter the new position for:
            </p>

            <p className="font-semibold mb-1">{moveModal.book?.title}</p>

            <p className="text-sm text-slate-500 mb-4">
              Current Position:{" "}
              <span className="font-bold text-[#c3a421]">
                {moveModal.book?.order || "-"}
              </span>
            </p>

            <input
              type="number"
              min="1"
              value={moveModal.newOrder}
              onChange={(e) =>
                setMoveModal((prev) => ({
                  ...prev,
                  newOrder: e.target.value,
                }))
              }
              placeholder={`Move to:`}
              className="w-full border border-slate-300 rounded-[6px] py-2 px-3 outline-none focus:border-[#c3a421] mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeMoveModal}
                disabled={updatingOrder}
                className="bg-slate-200 text-slate-700 py-2 px-4 rounded font-bold disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleMovePosition}
                disabled={updatingOrder}
                className="bg-[#c3a421] text-white py-2 px-4 rounded font-bold disabled:opacity-60"
              >
                {updatingOrder ? "Updating..." : "Update Position"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-4 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[9999] w-[90%] max-w-[600px] text-center text-base">
          <strong className="text-[1.2rem] mb-2 block">{modal.title}</strong>

          <span>{modal.message}</span>

          <br />

          {modal.onYes ? (
            <div className="mt-4">
              <button
                onClick={() => {
                  modal.onYes();
                  setModal({ ...modal, show: false });
                }}
                className="bg-[#e53e3e] text-white border-none py-2 px-5 font-bold rounded-[6px] mr-4 cursor-pointer"
              >
                Yes
              </button>

              <button
                onClick={() => setModal({ show: false })}
                className="bg-[var(--bg-color-header)] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setModal({ show: false })}
              className="bg-[var(--bg-color-header)] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer mt-4"
            >
              Close
            </button>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
