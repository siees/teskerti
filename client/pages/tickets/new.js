import { useState } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => Router.push('/tickets'),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Create a Ticket</h1>
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          className="form-control"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {errors}
      <button className="btn btn-primary">Add ticket</button>
    </form>
  );
};

export default NewTicket;