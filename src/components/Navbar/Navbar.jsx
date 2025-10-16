import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ containerStyles, onClick }) => {
  const navLinks = [
    { path: '/', title: 'Trang chủ' },
    { path: '/collection', title: 'Sản phẩm' },
  ];

  return (
    <nav className={containerStyles}>
      {navLinks.map((link) => (
        <NavLink
          key={link.title}
          to={link.path}
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm sm:text-base ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`
          }
          onClick={onClick}
        >
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;