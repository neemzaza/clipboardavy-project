import React, { useEffect, useState } from 'react'
import $ from 'jquery'

const { ipcRenderer } = window.require('electron');
const ipc = ipcRenderer

const db = require('../public/db/stores/todoItem');

function Bar() {

    const [dataLength, setDataLength] = useState(0)

    const readAllFunc = () => {
        db.readAll().then((allTodolists: any[]) => {
    
            setDataLength(allTodolists.length)
        })
    } 

    useEffect(() => {
        readAllFunc()
        ipc.send('updateTouchBar')
    })

    const onClose = () => {
        ipc.send('closeApp')
    }

    const onMinimize = () => {
        ipc.send('minimizeApp')
    }

    return (
        <nav className="fixed-top nav-top">
            <div className="menubar">
                <button className="menubar-btn close" onClick={onClose} id="close-btn" role="button"><i className="bi bi-x"></i></button>
                <button className="menubar-btn minimize" onClick={onMinimize}  role="button"><i className="bi bi-dash"></i></button>
                <label>{dataLength} text <i className="bi bi-card-text"></i></label>
                {/* <button className="menubar-btn add right" onClick={onMinimize}  role="button"><i className="bi bi-plus"></i></button> */}
            </div>
            <div className="container">
                <section className="title">
                    <h1><b>Clipboardavy</b></h1>
                </section>
            </div>
        </nav>
    )
}

export default Bar
