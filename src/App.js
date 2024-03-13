//--------------------------------------------------------------------------------------------------------------------------------------------
import "./styles.css";
import React, { useEffect, useState, useRef } from "react";
import { auth, provider, db } from "../src/frbsbknd";
 
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { signInWithPopup } from "firebase/auth"; // for login pg2
import { signOut } from "firebase/auth"; // for logout navbar
import {
  addDoc, // to add data in firebase cloud
  collection, // access the collection created in firebase db
  getDocs, // get the data frm the collection n display in ui
  deleteDoc, //  delete using deleteDoc,
  doc, //  doc used to access n delete indivisual data(id) frm the collection
  serverTimestamp, // to add timestamp
  query, // in useeff <Chat/> query(collectiondb, where("room"==room))
  where, // to specify query so we only get those messages for the room where we are where("room"=room), other similar middlewheres are available like sum, average, orderby, count, limit that u can check out in console query builder
  onSnapshot, // listen to changes in db which we can use in <Chat/> useEffect
  orderBy, // another middlewere that rearranges the query in ascending/decending order based on passed condition
} from "firebase/firestore";

export default function App(props) {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("user"));
  let [room, setRoom] = useState("");
  return (
    <div className="App">
      <Router>
        <Navbar isAuth={isAuth} setIsAuth={setIsAuth} /> <hr />
        <Routes>
          <Route path="/" element={<Page1 />} />
          <Route path="/Page2" element={<Page2 setIsAuth={setIsAuth} />} />
          <Route
            path="/Page3"
            element={<Page3 room={room} setRoom={setRoom} isAuth={isAuth} />}
          />
          <Route path="/Page4" element={<Page4 />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //     ---------------------components & functions--------------------

function Page1() {
  const navigate = useNavigate();
  const [dispdta, setDispdta] = useState("");
  const [dispdta2, setDispdta2] = useState("");

  useEffect(() => {
    let tm1 = setTimeout(() => {
      setDispdta("Welcome to BaseChat ");
    }, 1000);
    let tm2 = setTimeout(() => {
      setDispdta2(
        "Non Logged users will be navigated to login page while Logged in users will be navigated to chat page."
      );
    }, 3000);
    let tm3 = setTimeout(() => {
      if (!localStorage.getItem("user")) {
        navigate("/Page2");
      } else {
        navigate("/Page3");
      }
    }, 7000);

    return () => {
      clearTimeout(tm1);
      clearTimeout(tm2);
      clearTimeout(tm3);
    };
  }, []);
  return (
    <div>
      <h1 className="btn">{dispdta}</h1>
      <h1 className="btn">{dispdta2}</h1>
    </div>
  );
}
//------------------------------------------------------------------------------------
// const Page2 = () => <h1>Page2</h1>;
function Page2({ setIsAuth }) {
  // login page
  let navigate = useNavigate();
  function signInWithGoogle() {
    signInWithPopup(auth, provider) // can use other methods like  redirect, whatever may seem convinient to u
      .then((result) => {
        const user = result.user;
        // console.log("user is : ", user);
        console.log("login success");
        // alert("login success");
        // creating an instance in local storage
        localStorage.setItem("user", JSON.stringify(user));
        // creating an instance in local storage so if user refreshes the page or closes browser n opens back they are still logged in
        setIsAuth(true);
        navigate("/page3"); // redirect to chatpage after login
      })
      .catch((error) => {
        console.log("error login: ", error);
        // alert("login error: ", error);
      });
  }
  return (
    <div>
      <h1>•ᴗ• Login Page</h1>
      <hr />
      <button className="btn" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <hr />
    </div>
  );
}
//------------------------------------------------------------------------------------

function Page3(props) {
  const { room, setRoom, isAuth } = props;
  // let [room, setRoom] = useState(""); // putting room n setroom in app.js n taking in here as props(so that setroom doesnt become "" everytime page changes and its initialized)
  // we grab the roomnaname from the input using ref instead of useState e.target.value coz as state value changes due to conditional rendering, input box disappears
  let roomref = useRef();
  let navigate = useNavigate();
  useEffect(() => {
    if (!isAuth) {
      navigate("/Page2"); // redirect to login if not auth frm creatpost page
      alert("Please login first");
    }
  }, []);

  return (
    <div>
      {/* <b>chatpage</b> */}
      {room === "" ? (
        <div>
          <span>
            Enter a room name (like "TESTROOM1"), if the room does not exist in
            the database, a new room will be created.
          </span>
          <br />
          <input
            className="btn"
            type="text"
            placeholder="room name"
            ref={roomref}
          />
          <button
            className="btn"
            onClick={() => {
              if (roomref.current.value.trim()) {
                setRoom(roomref.current.value.toUpperCase().trim());
              } else {
                alert("Please enter room name");
              }
            }}
          >
            enter
          </button>
        </div>
      ) : (
        <div>
          <b>{room.toUpperCase()}</b>
          <hr />
          <button className="btn" onClick={() => setRoom("")}>
            exit room
          </button>
          <hr />
          <Chat room={room} />
        </div>
      )}
      <br />
      <hr />
    </div>
  );
}

function Chat({ room }) {
  let [msg, setMsg] = useState("");
  const [dta, setDta] = useState([]);
  const inputRef = useRef(null);
  useEffect(() => {
    var unsubscribecleanupsnpsht; // declearing it here so lexical scoping issue does not occor
    // this useEffect will immidiatly run once on page load(also on message send [msg] dependency array) and load data frm database collection posts and set the state setDta with data
    async function getPosts() {
      const postcollectiondbmsg = collection(db, "messages");
      const roomquery = query(
        postcollectiondbmsg,
        where("room", "==", room),
        orderBy("created", "asc")
        /* will give error first time, need to manually create query frm given link in console
        @firebase/firestore: Firestore (10.8.1): Uncaught Error in snapshot listener: FirebaseError: [code=failed-precondition]: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/basechat-5fbeb/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9iYXNlY2hhdC01ZmJlYi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbWVzc2FnZXMvaW5kZXhlcy9fEAEaCAoEcm9vbRABGgsKB2NyZWF0ZWQQARoMCghfX25hbWVfXxAB
        it will take 1 min to build, now working */
      );
      unsubscribecleanupsnpsht = onSnapshot(roomquery, (snapsht) => {
        // console.log("new message", snapsht); // snpsht is big obj with many data, we now extract only what we need
        setDta(snapsht.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); // now only room1 messages visible
        inputRef.current.focus();
      });
      //----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    }
    getPosts();
    //  }, [msg]); // now no need for msg dependency to run useEffect again and again and getDocs everytime we send message as snapshot method doing same thing along with listening to query where we only take in data where("room"=room), it works even faster now
    return () => {
      unsubscribecleanupsnpsht(); // cleanup
    };
  }, []);
  // // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault(); // prevent form from refreshing
    if (msg.trim() === "") {
      setMsg("");
      return;
    } else {
      // console.log(msg.trim());
      // setMsg("");
      const collectiondb = collection(db, "messages"); // creating a collection in database and passing in the db(getFirestore) and collection name ("messages"/xxxx as we created in firebase database)
      // console.log(collectiondb);
      try {
        // await addDoc(collectiondb, { text: "test" }); // try again tommorow maybe Provisioning Cloud Firestore will be complete
        await addDoc(collectiondb, {
          text: msg,
          created_dt: new Date().toLocaleString(),
          created: serverTimestamp(),
          uid: auth.currentUser.uid,
          mail: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL, //can display user photo, alternatively use firebase hooks
          name: auth.currentUser.displayName,
          room: room,
        }).then(() => {
          setMsg("");
          console.log("message sent");
        });
      } catch (err) {
        console.log("error: ", err);
      }
    }
  }
  // // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="chatdiv">
      {/* {JSON.stringify(item)} */}
      {dta.map((item, indx) => (
        // item.room === room && ( currently asscessing all the messages, lets use "where" keyword during query in usestate so it checks for only those data where("room"==room)
        <div
          className={item?.mail === auth?.currentUser?.email ? "msg1" : "msg2"}
          key={item?.id}
        >
          {/* {console.log("<Chat/> dta[indx].mail   :     ", dta[indx].mail)}
          {console.log("<Chat/> item.mail   :     ", item.mail)}
          {console.log(
            "<Chat/> auth?.currentUser?.email ",
            auth?.currentUser?.email,
          )} */}
          {/* ---------------------- */}
          {/* {console.log(JSON.stringify(item))}
          {/* {JSON.stringify(item)} */}
          {/* <p>{item.created.toLocaleString()}</p> */}
          {/* <p>{item.uid}</p>  u can use it to delete the iteam by passing it in a del button as clbk arg, check id user logged in with auth.currentUser.uid===item.uid to display the button or not, create a delfunctionclbk that uses deleteDoc() method to delete the iteam frm db */}
          {/* <b>name- {item.name}</b> --  */}
          <small>
            <i>{item?.mail}</i>
          </small>

          <br />

          <small>
            <small>
              <small>
                <i>{item?.created_dt}</i>
              </small>
            </small>
          </small>
          <br />
          <b>message- {item?.text} </b>

          {/* room:{item?.room} */}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          id="msgid"
          className="btn"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="btn" type="submit">
          send
        </button>
      </form>
      {/* <button onClick={createcollectionindb}>createcollectionindbtest</button> // also uncomment the clbk funct "createcollectionindb" above */}
    </div>
  );
}

//------------------------------------------------------------------------------------

function Error() {
  let navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, []);

  return (
    <div>
      <h1 className="ld">ERROR PAGE</h1>
      <p className="ld">redirecting home in 3sec...</p>
    </div>
  );
}

//------------------------------------------------------------------------------------

// const Navbar = () => {
//   return (
//     <nav>
//       <NavLink to="/">Page1_home</NavLink>
//       <br />
//       <NavLink to="/Page2">Page2</NavLink>
//       <br />
//       <NavLink to="/Page3">Page3</NavLink>
//     </nav>
//   );
// };
function Navbar(props) {
  let navigate = useNavigate();
  function logoutt() {
    signOut(auth)
      .then(() => {
        props.setIsAuth(false);
        localStorage.removeItem("user");
        console.log("logout success");
        navigate("/Page2"); // redirect to login page after logout
      })
      .catch((error) => {
        alert("logout error: ", error);
      });
  }
  return (
    <nav>
      <NavLink to="/">⚛Home</NavLink>
      {!props.isAuth ? (
        <NavLink to="/Page2">⚛Login</NavLink>
      ) : (
        <button className="btn" onClick={logoutt}>
          ⚛Log Out
        </button>
      )}
      {props.isAuth && <NavLink to="/Page3">⚛JoinChat</NavLink>}
      <NavLink to="/Page4">⚛About</NavLink>
    </nav>
  );
}
//------------------------------------------------------------------------------------
const Page4 = () => {
  return (
    <div>
      <h1>🧐 About the project</h1>
      <hr />
      <ul>
        <li>This is a Firebase and React app</li>
        <li>
          Cloud Firestore is a NoSQL document database that lets you easily
          store, sync, and query data for your mobile and web apps - at global
          scale.
        </li>
        <li>
          React ⚛️ is the library for web and native user interfaces. Build user
          interfaces out of individual pieces called components written in
          JavaScript.
        </li>

        <li>This project has 3 pages:</li>
        <li>
          Home Page (Page1) - Welcome page that will navigate to Login Page or
          JoinChat page based on login status of the user.
        </li>
        <li>
          Login Page (Page2) - allows users to sign in with Google. Once logged
          in, login is replaced by logout button in navbar.
        </li>
        <li>
          JoinChat Page (Page3) - allows authenticated users to join/create
          chatrooms.
        </li>
        <li>
          Sent and recieved messages in any group would have different color
          theme.
        </li>
        <li>
          All the code for this project available at <br />
          <a id="ghlink" href="https://github.com/tfml1" target="_blank">
            <b>https://github.com/tfml1</b>
          </a>
          <br />
          <i>(click to open in new window)</i>
          <br />
          If you find this project useful, consider giving it a star "⭐️".
        </li>
        <li>
          P.S. : All the sent messages will have user's gmail id so please post
          with caution.
        </li>
      </ul>
      <hr />
      <br />
      <span className="btn"> ⚛⚛⚛⚛⚛ </span>
      <br />
      <br />
      <hr />
    </div>
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////
//--------------------------------------------------------------------------------------------------------------
// step by step working of the code-->>

/*


    The code begins by importing necessary modules and components from React, React Router, and Firebase.

    App is a functional component that utilizes React's useState to manage authentication status and room state.

    useState is used to initialize isAuth with the value from localStorage to persist authentication status between sessions.

    useState is also used to initialize room with an empty string.

    The App component returns a Router component that wraps the entire application for navigation.

    Navbar is a child component of App that receives isAuth and setIsAuth as props.

    Inside the Router, Routes define the various paths and their corresponding components.

    Page1, Page2, Page3, Page4, and Error components are used for different routes.

    Page1 is a functional component that uses useNavigate to programmatically navigate between routes.

    Page1 also uses useEffect to display messages and navigate after specific timeouts.

    The useEffect hook in Page1 has three setTimeout functions to display messages and navigate. These timeouts are cleared on component unmount using a cleanup function.

    Page2 is a functional component for the login page, which provides a Google sign-in functionality.

    Page2 contains a signInWithGoogle function that uses Firebase's signInWithPopup method for authentication.

    Successful authentication in Page2 stores the user object in localStorage, sets isAuth to true, and navigates to Page3.

    If authentication fails in Page2, it logs the error.

    Page3 is a functional component that takes room, setRoom, and isAuth as props.

    Page3 uses useEffect to redirect unauthenticated users to Page2.

    Page3 allows users to enter a room name, which updates the room state when submitted.

    If room is not empty in Page3, it displays the current room name and a Chat component.

    Chat is a functional component that takes room as a prop.

    Chat uses useState to manage the message input and an array of messages (dta).

    Chat uses a useEffect hook to fetch messages from the Firebase Firestore database using a query that filters messages by room.

    The useEffect in Chat sets up a real-time subscription to Firestore using onSnapshot that updates the dta array when new messages arrive.

    unsubscribeCleanupsnpsht is a variable in Chat that holds the unsubscribing function for the Firestore subscription.

    Chat returns a form for sending messages and a list of messages using the dta array.

    Chat maps over the dta array to render each message with the sender's email and timestamp.

    The handleSubmit function in Chat prevents the default form submission, checks for empty messages, and sends non-empty messages to Firestore.

    handleSubmit adds a new document to the Firestore collection with the message and other metadata.

    After a successful message send, handleSubmit clears the message input and logs a confirmation.

    The form in Chat includes an input for typing messages and a button for submission.

    The input element in Chat is linked to the msg state, and its value is updated on change.

    Chat also uses a useRef to focus the input element after messages are loaded.

    The Navbar component (not shown in the provided code) likely contains navigation links and authentication controls.

    The signOut function from Firebase's auth module is imported but not shown in the provided code. It would be used for logging out users.

    The addDoc, collection, getDocs, deleteDoc, doc, serverTimestamp, query, where, onSnapshot, and orderBy functions are all Firestore methods used for interacting with the database.

*/
