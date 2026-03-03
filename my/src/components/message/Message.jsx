import "./Message.css";

export default function Message({ text, type }) {
  return (
    <div
      className="messageBox"
      style={
        type == "error"
          ? { backgroundColor: "red" }
          : { backgroundColor: "green" }
      }
    >
      <p>{text}</p>
    </div>
  );
}
