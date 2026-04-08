import React from 'react';
import { Link } from 'react-router-dom';
import './style/mysaved.css'

const MysavedRowComponent = ({ post, index, onDelete }) => {
  return (
    <tr className="datatable">
      <td>{index + 1}</td>
      <td>{post._id}</td>

      <td>
        <Link to={'/posts/' + post._id}>{post.title}</Link>
      </td>

      <td>{post.category.name}</td>

      <td>{post.author}</td>

      <td>
        <img
          src={"data:image/jpg;base64," + post.image}
          width="70px"
          height="70px"
          alt=""
        />
      </td>

      <td>
        <span
          className="link"
          onClick={() => onDelete(post._id)}
        >
          Xóa
        </span>
      </td>
    </tr>
  );
};

export default MysavedRowComponent;