import React from 'react';
import { slide as Menu } from 'react-burger-menu';  /* maybe stack instead of slide */

import '../globals.css'

export default props => {
  return (
    <Menu >
      <a className="menu-item" href="/map">
        Item1
      </a>
      <a className="menu-item" href="/map">
        Item2
      </a>
      <a className="menu-item" href="/map">
        Item3
      </a>
    </Menu>
  );
};