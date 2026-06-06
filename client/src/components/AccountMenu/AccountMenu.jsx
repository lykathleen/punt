import React, { useEffect, useRef, useState } from "react";
import "./AccountMenu.css";

export function AccountMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="account-trigger"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span>{user.displayName}</span>
        <span className="chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="account-dropdown" role="menu">
          <div className="account-details">
            <span>Account</span>
            <strong>{user.email}</strong>
          </div>
          <button className="menu-item" onClick={onLogout} role="menuitem" type="button">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
