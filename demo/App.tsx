import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BasicEditor } from './pages/BasicEditor';
import { FullFeatured } from './pages/FullFeatured';
import { MinimalEditor } from './pages/MinimalEditor';
import { ReadOnlyEditor } from './pages/ReadOnlyEditor';
import { NoToolbar } from './pages/NoToolbar';
import { DarkTheme } from './pages/DarkTheme';
import { CustomToolbar } from './pages/CustomToolbar';
import { MultipleInstances } from './pages/MultipleInstances';

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/basic", element: <BasicEditor /> },
  { path: "/full", element: <FullFeatured /> },
  { path: "/minimal", element: <MinimalEditor /> },
  { path: "/readonly", element: <ReadOnlyEditor /> },
  { path: "/no-toolbar", element: <NoToolbar /> },
  { path: "/dark", element: <DarkTheme /> },
  { path: "/custom-toolbar", element: <CustomToolbar /> },
  { path: "/multiple", element: <MultipleInstances /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}


