import "./UserPage.css";

export default function UserPage({ user }) {
  return (
    <div className="userPage">
      <div className="userPage__header">
        <h2>
          {user.name} ({user.login})
        </h2>
        <p>Вы {user.role === "visitor" ? "Посетитель" : "Админ"}</p>
      </div>
    </div>
  );
}
