import React, { useState, useEffect } from "react";
import "./App.scss";
import Bar from "./Bar";
import $ from "jquery";

const electron = window.require("electron");

const { ipcRenderer } = window.require("electron");
const ipc = ipcRenderer;

const db = require("../public/db/stores/todoItem");

function App() {
  const [allData, setAllData]: Array<any> = useState([]);
  const [toggleEdit, setToggleEdit] = useState(false);

  const [selectText, setSelectText]: Array<any> = useState([]);

  const [clipboardText, setClipboardText] = useState("");

  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    readAllFunc();
  }, []);

  useEffect(() => {
    if (toggleEdit) {
      console.log("Editing...");
      $("#edit-btn").text("Cancel");

      $(".delete-section").css({
        visibility: "hidden",
        opacity: "0",
      });

      $(".select-section").css({
        visibility: "visible",
        opacity: "1",
      });

      $("#delete-many-btn").css({
        visibility: "visible",
        opacity: "1",
      });
    } else {
      console.log("Not Editing...");
      $("#edit-btn").text("Edit");

      $(".select-section").css({
        visibility: "hidden",
        opacity: "0",
      });

      $(".delete-section").css({
        visibility: "visible",
        opacity: "1",
      });

      $("#delete-many-btn").css({
        visibility: "hidden",
        opacity: "0",
      });
    }
  }, [toggleEdit]);

  useEffect(() => {
    console.log(selectText);
  }, [selectText]);

  const readAllFunc = () => {
    db.readAll().then((allTodolists: any[]) => {
      setAllData(allTodolists);
    });
  };

  const onAddData = (data: any) => {
    db.create({ content: data }).then(() => {
      $("#input-clipboard").val("");
      readAllFunc();
      ipc.send("updateTouchBar");
    });
  };

  // DANGER ZONE
  const onRemoveData = (id: any) => {
    db.remove({ _id: id }).then(() => {
      console.log("Removed " + id);
      readAllFunc();
    });
  };

  const deleteManyBySel = () => {
    for (let i = 0; i < selectText.length; i++) {
      db.remove({ _id: selectText[i] }).then(() => {
        console.log("Removed " + selectText[i]);
        toggleEditMode();
        readAllFunc();
      });
    }
  };

  const toggleEditMode = () => {
    setToggleEdit(!toggleEdit);

    if (toggleEdit === false) {
      setSelectText([]);
      $(".check-box-text").prop("checked", false);
    }
  };

  const onSelectText = (checked: boolean, id: string) => {
    let havenOnSelection = selectText.filter(checkHavenOnSelection);

    if (checked) {
      console.log("Checked " + id);
      setSelectText([...selectText, id]);
    } else {
      if (havenOnSelection) {
        console.log("Removed and unchecked " + id);
        setSelectText(
          selectText.filter((selectTexts: any) => selectTexts !== id)
        );
      } else {
        console.log("Unchecked " + id);
      }
    }

    function checkHavenOnSelection(data: any) {
      return data !== id;
    }

    function removeHavenOnSelection(data: any) {
      return data !== id;
    }
  };

  const onReadTextOnClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      setClipboardText(text);
      $("#input-clipboard").val($("#input-clipboard").val() + text);
    });
  };

  const sortMode = () => {
    switch (sortBy) {
      case "date":
        allData.sort((a: any, b: any) => {
          if (a.createdAt < b.createdAt) return 1;
          if (a.createdAt > b.createdAt) return -1;
          return 0;
        });
        break;
      
      case "name":
        allData.sort((a: any, b: any) => {
          if (a.content < b.content) return -1;
          if (a.content > b.content) return 1;
          return 0;
        });
        break;

      default:
        allData.sort((a: any, b: any) => {
          if (a.createdAt < b.createdAt) return 1;
          if (a.createdAt > b.createdAt) return -1;
          return 0;
        });
    }
  };

  return (
    <div className="main-page">
      <Bar />
      <div className="container">
        <div className="card clipboard-input flex">
          <input
            className="text"
            placeholder="New text"
            id="input-clipboard"
            onKeyUp={(e) =>
              e.key === "Enter"
                ? $("#input-clipboard").val() !== ""
                  ? onAddData($("#input-clipboard").val())
                  : null
                : null
            }
          />
          <a
            className="btn btn-sm clipboard-btn"
            href="#"
            role="button"
            onClick={() => onReadTextOnClipboard()}
          >
            <i className="bi bi-clipboard"></i>
          </a>
        </div>
        <br />
        {allData.length > 0 ? (
          <section className="sort-menu">
            <a
              className="btn btn-sm "
              id="edit-btn"
              onClick={toggleEditMode}
              role="button"
            >
              Edit
            </a>
            <a
              className="btn btn-sm btn-danger"
              id="delete-many-btn"
              onClick={deleteManyBySel}
              role="button"
            >
              Delete
            </a>

            <div className="dropdown right-side">
            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              Sort by {sortBy}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><a className={"dropdown-item " + (sortBy === "date" ? "active" : "")} onClick={() => setSortBy("date")} href="#">Date</a></li>
              <li><a className={"dropdown-item " + (sortBy === "name" ? "active" : "")} onClick={() => setSortBy("name")} href="#">Name</a></li>
            </ul>
          </div>
          </section>
        ) : null}
        <section className="content scroll-area">
          {allData.length > 0 ? (
            allData.sort(sortMode()).map((val: any, i: any) => (
              <div
                className="card clipboard-text"
                title="Click to copy to clipboard"
                id={val._id}
              >
                <div className="flex">
                  <section className="select-section">
                    <div className="form-check">
                      <input
                        className="form-check-input check-box-text"
                        title="Click to select"
                        type="checkbox"
                        value=""
                        id="flexCheckDefault"
                        onChange={(e) =>
                          onSelectText(e.target.checked, val._id)
                        }
                      />
                    </div>
                  </section>
                  <section className="delete-section">
                    <a
                      className="btn btn-sm delete-btn"
                      role="button"
                      title="Click to remove this text"
                      onClick={() => onRemoveData(val._id)}
                    >
                      <i className="bi bi-x"></i>
                    </a>
                  </section>
                  <section
                    className="click-selection"
                    onClick={() => navigator.clipboard.writeText(val.content)}
                  >
                    <p className="text" id="text">
                      {val.content}
                    </p>
                  </section>
                </div>
              </div>
            ))
          ) : (
            <>
              <h5>Not have any text yet.</h5>
              <h5>Type in "New text" to add text</h5>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
