import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout, ProtectedRoute } from './components/Layout';
import Feed from './pages/Feed';
import Auth from './pages/Auth';
import PostDetail from './pages/PostDetail';
import { TagPage, Tags } from './pages/TagPages';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Settings from './pages/Settings';
import './styles.css';

function App() { return <AuthProvider><BrowserRouter><Routes><Route element={<Layout/>}><Route index element={<Feed/>}/><Route path="post/:slug" element={<PostDetail/>}/><Route path="tags" element={<Tags/>}/><Route path="tag/:slug" element={<TagPage/>}/><Route path="profile/:id" element={<Profile/>}/><Route path="login" element={<Auth mode="login"/>}/><Route path="register" element={<Auth mode="register"/>}/><Route path="dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/><Route path="editor/new" element={<ProtectedRoute><Editor/></ProtectedRoute>}/><Route path="editor/:id" element={<ProtectedRoute><Editor/></ProtectedRoute>}/><Route path="settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/><Route path="*" element={<div className="empty-state"><h1>That page wandered off.</h1><a className="button button-dark" href="/">Back to the feed</a></div>}/></Route></Routes></BrowserRouter></AuthProvider>; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
