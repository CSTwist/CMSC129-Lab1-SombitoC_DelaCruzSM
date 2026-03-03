import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import '../styles/DashboardContent.css';
import AddJournal from '../components/AddJournal.jsx';
import JournalEntry from '../components/JournalEntry.jsx';

function DashboardContent(){
    return (
        <Container className="dashboard-content d-flex flex-column align-items-center  min-vh-100">
                <p id="dashboard-greetings">How was your day?</p>
                <AddJournal/>
                {/* Temporary static journal entries */}
                <JournalEntry/>
                <JournalEntry/>
        </Container>
    );
}

export default DashboardContent