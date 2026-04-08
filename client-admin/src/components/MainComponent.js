import React, { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import Category from './CategoryComponent';
import Post from './PostComponent';
import Comment from './CommentComponent';
import Reader from './ReaderComponent';

class Main extends Component {
  static contextType = AuthContext;

  render() {
    if (this.context.token !== '') {
      return (
        <div className="body-admin">
          <Menu />
          <Routes>
            <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
            <Route path='/admin/home' element={<Home />} />
            <Route path='/admin/category' element={<Category />} />
            <Route path='/admin/post' element={<Post />} />
            <Route path="/admin/comment" element={<Comment />} />
            <Route path='/admin/reader' element={<Reader />} />
          </Routes>
        </div>
      );
    }
    return (<div />);
  }
}

export default Main;