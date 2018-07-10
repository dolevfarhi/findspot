import React from 'react';
import NavLink from './NavLink';

const Navigation = ({ links }) => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-5">
      <a className="navbar-brand" href="#">Kindle Books</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
        { links && links.map((item, index) =>  <NavLink key={index} link={item} />  ) }
        </ul>
      </div>
    </nav>
  );

export default Navigation;
