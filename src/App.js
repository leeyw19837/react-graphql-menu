import React, { useMemo, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./App.css";

const MenuItem = ({ name, id, price, rating }) => {
  //just for fun
  const COLORS = ["#ff00f6", "#00ff50", "#fff900", "#ff8300"];
  const color = useMemo(
    () => () => COLORS[Math.floor(Math.random() * COLORS.length)],
    []
  );

  return (
    <div className="menu-item">
      <div className="info">
        <p className="name" style={{ color }}>
          {`${name} *${rating}`}
        </p>
        <p className="item-price" style={{ color }}>
          {price}
        </p>
      </div>
      <div className="action">
        <button type="button" style={{ color, borderColor: color }}>
          Delete
        </button>
      </div>
    </div>
  );
};

const GET_MENU_ITEMS = gql`
  query {
    menuItems {
      id
      name
      price
      rating
    }
  }
`;

const CREATE_MENU_ITEM = gql`
  mutation addMenuItem($name: String!, $price: Int!, $rating: Int) {
    addMenuItem(params: { name: $name, price: $price, rating: $rating }) {
      id
      name
      price
      rating
    }
  }
`;

const Form = ({ setFormOpen }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState();
  const [rating, setRating] = useState();
  const [addMenuItem] = useMutation(CREATE_MENU_ITEM, {
    update(cache, { data: { addMenuItem } }) {
      const { menuItems } = cache.readQuery({ query: GET_MENU_ITEMS });
      cache.writeQuery({
        query: GET_MENU_ITEMS,
        data: { menuItems: [addMenuItem, ...menuItems] },
      });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();

    addMenuItem({
      variables: {
        name,
        price: Number(price),
        rating: Number(rating),
      },
    });

    setFormOpen(false);
  };

  return (
    <>
      <form className="form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            id="name"
            value={name}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            onChange={(e) => setPrice(e.target.value)}
            id="price"
            value={price}
          />
        </div>
        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <input
            type="number"
            onChange={(e) => setRating(e.target.value)}
            id="rating"
            value={rating}
          />
        </div>
      </form>
      <button type="button" onClick={onSubmit}>
        Submit
      </button>
    </>
  );
};

// Edit Form component to:
const App = () => {
  const [formOpen, setFormOpen] = useState(false);
  const { loading, error, data } = useQuery(GET_MENU_ITEMS);
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error</p>;
  }

  const { menuItems } = data;

  return (
    <div className="App">
      <div className="App-body">
        <div className="add-form">
          <button onClick={() => setFormOpen((o) => !o)}>Add Item</button>
          {formOpen && <Form setFormOpen={setFormOpen} />}
        </div>
        <div className="menu-box">
          {menuItems.map((item) => (
            <MenuItem key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
