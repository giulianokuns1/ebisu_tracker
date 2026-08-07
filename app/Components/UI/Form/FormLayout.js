import React from 'react';
import styles from './FormLayout.module.scss';

export const FormSection = ({ icon, title, optional = false, children }) => <section className={styles.section}><header><span><i className={`bi ${icon}`} aria-hidden="true" /></span><h2>{title}{optional && <small>Optional</small>}</h2></header><div className={styles.sectionBody}>{children}</div></section>;

export const FormActionBar = ({ editing = false, onCancel, onDelete, createLabel, updateLabel }) => <footer className={styles.actions}>{editing && <button className={styles.delete} type="button" onClick={onDelete}><i className="bi bi-trash3" aria-hidden="true" /> Delete</button>}<div className={styles.rightActions}><button className={styles.cancel} type="button" onClick={onCancel}>Cancel</button><button className={styles.primary} type="submit"><i className={`bi ${editing ? 'bi-check2-circle' : 'bi-plus-circle'}`} aria-hidden="true" /> {editing ? updateLabel : createLabel}</button></div></footer>;

export const FormShell = ({ children, className = '' }) => <div className={`${styles.shell} ${className}`}>{children}</div>;
