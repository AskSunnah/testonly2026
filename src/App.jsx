import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//admin imports
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ProtectedRoute from "./Components/Admin/ProtectedRoute";
import AddQA from "./Pages/Admin/AddQA";
import AllQA from "./Pages/Admin/AllQA";
import AddBook from "./Pages/Admin/AddBook";
import AllBooks from "./Pages/Admin/AllBooks";
import UserQuestions from "./Pages/Admin/UserQuestions";
import EditBook from "./Pages/Admin/EditBook";
import Feedback from "./Pages/Admin/Feedback";
import AdminReports from "./Pages/Admin/Reports";
import ManageAuthors from "./Pages/Admin/ManageAuthors";
import PinnedSectionPage from "./Pages/Admin/PinnedSectionPage";
import ManageQACategories from "./Pages/Admin/ManageCategories";

import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-qa-standalone"
          element={
            <ProtectedRoute>
              <AddQA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-qa"
          element={
            <ProtectedRoute>
              <AddQA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-qa"
          element={
            <ProtectedRoute>
              <AllQA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-book"
          element={
            <ProtectedRoute>
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-books"
          element={
            <ProtectedRoute>
              <AllBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/edit/:lang/:slug"
          element={
            <ProtectedRoute>
              <EditBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-questions"
          element={
            <ProtectedRoute>
              <UserQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pinned-section"
          element={
            <ProtectedRoute>
              <PinnedSectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/authors"
          element={
            <ProtectedRoute>
              <ManageAuthors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/en"
          element={
            <ProtectedRoute>
              <AllBooks lang="en" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/ar"
          element={
            <ProtectedRoute>
              <AllBooks lang="ar" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qa-categories"
          element={
            <ProtectedRoute>
              <ManageQACategories />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
