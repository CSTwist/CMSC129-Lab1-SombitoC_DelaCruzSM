import '../styles/DashboardContent.css';

function AddJournal() {
  const handleClick = () => {
    console.log("Add Journal clicked");
  };

  return (
    <button
      className="add-journal btn btn-primary d-flex align-items-center justify-content-center gap-2 rounded-4"
      onClick={handleClick}
    >
        <i className="bi bi-plus-square"></i>
        New entry
    </button>
  );
}

export default AddJournal;