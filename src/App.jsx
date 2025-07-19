import { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { LazyLoadComponent } from "react-lazy-load-image-component";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [newTodo, setNewTodo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const todosPerPage = 10;
  const pagesVisited = pageNumber * todosPerPage;

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = filterDate
      ? todo.date === filterDate
      : true;
    return matchesSearch && matchesDate;
  });

  const displayTodos = filteredTodos
    .slice(pagesVisited, pagesVisited + todosPerPage)
    .map((todo) => (
      <LazyLoadComponent key={todo.id}>
        <li className="p-3 border rounded flex justify-between items-center">
          <div>
            <p className={todo.completed ? "line-through" : ""}>
              {todo.title}
            </p>
            <p className="text-xs text-gray-500">Date: {todo.date}</p>
          </div>
          <span className="text-sm">
            {todo.completed ? "Completed" : "Pending"}
          </span>
        </li>
      </LazyLoadComponent>
    ));

  const pageCount = Math.ceil(filteredTodos.length / todosPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos"
      );
      // Add mock date to each todo
      const todosWithDate = response.data.map((todo, index) => {
        const randomDate = `2024-07-${(index % 30) + 1}`; // generate fake date
        return { ...todo, date: randomDate };
      });
      setTodos(todosWithDate);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/todos",
        {
          userId: 1,
          title: newTodo,
          completed: false,
        }
      );

      // Assign today's date to new todo
      const today = new Date().toISOString().split("T")[0];

      const newTodoWithDate = { ...response.data, date: today };

      setTodos((prev) => [newTodoWithDate, ...prev]);
      setNewTodo("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl text-red-500">Error: {error.message}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Todo List</h1>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search todos..."
          className="p-2 border border-gray-300 rounded w-full sm:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border border-gray-300 rounded w-full sm:w-1/2"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Add Todo */}
      <form
        onSubmit={addTodo}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      <ul className="space-y-3">{displayTodos}</ul>

      {/* Pagination */}
      <ReactPaginate
        previousLabel={"← Prev"}
        nextLabel={"Next →"}
        pageCount={pageCount}
        onPageChange={changePage}
        containerClassName={"flex justify-center items-center mt-6 flex-wrap gap-2"}
        pageLinkClassName={"px-3 py-1 border rounded hover:bg-gray-200"}
        previousLinkClassName={"px-3 py-1 border rounded hover:bg-gray-200"}
        nextLinkClassName={"px-3 py-1 border rounded hover:bg-gray-200"}
        activeLinkClassName={"bg-black text-white"}
        disabledClassName={"opacity-50 cursor-not-allowed"}
      />
    </div>
  );
};

export default App;
