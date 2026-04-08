import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import MysavedRowComponent from './MysavedRowComponent';
import './style/mysaved.css'
class MysavedComponent extends Component {
  static contextType = MyContext;

  render() {
    const mysaved = this.context.mysaved.map((post, index) => {
      return (
        <MysavedRowComponent
          key={post._id}
          post={post}
          index={index}
          onDelete={(id) => this.btnRemoveClick(id)}
        />
      );
    });

    return (
      <div className="align-center">
        <h2 className="text-center">TIN ĐÃ LƯU</h2>

        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tác giả</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>

            {mysaved}

            {mysaved.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  Chưa có bài viết nào được lưu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  btnRemoveClick(id) {
    const mysaved = this.context.mysaved.filter(x => x._id !== id);
    this.context.setMysaved(mysaved);
  }
}

export default MysavedComponent;