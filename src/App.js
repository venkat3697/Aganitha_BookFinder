import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Modal,
  ListGroup,
  Alert,
} from "react-bootstrap";

function App() {
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [sortOption, setSortOption] = useState("relevance");
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const maxResults = 10;

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  const fetchBooks = async () => {
    if (query) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${query}&orderBy=${sortOption}&startIndex=${startIndex}&maxResults=${maxResults}`
        );
        if (response.data.items && response.data.items.length > 0) {
          setBooks(response.data.items);
          setErrorMessage(""); // Clear error if books are found
        } else {
          setBooks([]);
          setErrorMessage("No results found."); // Set error if no books found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Network error occurred. Please try again later.");
        setBooks([]); // Clear any previous results on error
      }
    } else {
      setErrorMessage("Please Enter Book, Title, Author");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setStartIndex(0); // Reset to first page on new search
    fetchBooks(); // Fetch books only when search is triggered
  };

  const handlePagination = (direction) => {
    setStartIndex((prev) => {
      if (direction === "next") {
        return prev + maxResults; // Move to next page
      } else if (direction === "previous" && prev > 0) {
        return prev - maxResults; // Move to previous page
      }
      return prev;
    });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setStartIndex(0); // Reset to first page when sorting changes
  };

  const addToFavorites = (book) => {
    const updatedFavorites = [...favorites, book];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const showBookDetails = (book) => {
    setSelectedBook(book);
    setRecentlyViewed((prev) => [
      book,
      ...prev.filter((b) => b.id !== book.id),
    ]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.username.value.length > 0) {
      setUsername(e.target.username.value);
      setErrorMessage("");
    } else {
      setErrorMessage("Please Enter name");
    }
  };

  useEffect(() => {
    if (query) {
      fetchBooks(); // Fetch books whenever query, startIndex, or sortOption changes
    }
  }, [query, startIndex, sortOption]); // Added startIndex as a dependency

  return (
    <Container className="App">
      {!username ? (
        <>
          <Form
            onSubmit={handleLogin}
            className="d-flex justify-content-center my-4"
          >
            <Form.Control
              name="username"
              type="text"
              placeholder="Enter your name"
              className="me-2"
              style={{ maxWidth: "300px" }}
            />
            <Button type="submit" variant="primary">
              Start
            </Button>
          </Form>

          {errorMessage && (
            <Alert variant="warning" className="text-center">
              {errorMessage}
            </Alert>
          )}
        </>
      ) : (
        <>
          <h1 className="text-center my-4">Welcome, {username}!</h1>

          {/* Search Form */}
          <Form
            onSubmit={handleSearch}
            className="d-flex justify-content-center mb-4"
          >
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author"
              className="me-2"
              style={{ maxWidth: "400px" }}
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Form>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="warning" className="text-center">
              {errorMessage}
            </Alert>
          )}

          {/* Sort and Pagination */}
          <Row className="justify-content-center mb-4">
            <Col xs="auto">
              <Form.Select
                value={sortOption}
                onChange={handleSortChange}
                className="me-2"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Button
                onClick={() => handlePagination("previous")}
                variant="secondary"
                disabled={startIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePagination("next")}
                variant="secondary"
                className="ms-2"
              >
                Next
              </Button>
            </Col>
          </Row>

          {/* Book List */}
          <Row xs={1} md={2} lg={3} className="g-4">
            {books.map((book) => (
              <Col key={book.id}>
                <Card onClick={() => showBookDetails(book)} className="h-100">
                  <Card.Img
                    variant="top"
                    src={book.volumeInfo.imageLinks?.thumbnail}
                    alt={book.volumeInfo.title}
                  />
                  <Card.Body>
                    <Card.Title>{book.volumeInfo.title}</Card.Title>
                    <Card.Text>{book.volumeInfo.authors?.join(", ")}</Card.Text>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToFavorites(book);
                      }}
                      variant="outline-primary"
                      size="sm"
                    >
                      Add to Favorites
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Book Details Modal */}
          <Modal show={!!selectedBook} onHide={() => setSelectedBook(null)}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedBook?.volumeInfo.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <strong>Authors:</strong>{" "}
                {selectedBook?.volumeInfo.authors?.join(", ")}
              </p>
              <p>
                <strong>Published Date:</strong>{" "}
                {selectedBook?.volumeInfo.publishedDate}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedBook?.volumeInfo.description}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Favorites and Recently Viewed Sidebar */}
          <Row className="my-4">
            <Col md={6}>
              <h3>Favorites</h3>
              <ListGroup>
                {favorites.map((book) => (
                  <ListGroup.Item key={book.id}>
                    {book.volumeInfo.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>

            <Col md={6}>
              <h3>Recently Viewed</h3>
              <ListGroup>
                {recentlyViewed.map((book) => (
                  <ListGroup.Item key={book.id}>
                    {book.volumeInfo.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default App;
