import { Container, Row, Col } from 'react-bootstrap';
import '../styles/JournalEntry.css';
import KebabMenu from '../components/JournalKebabMenu.jsx';
import journalImg from '../assets/journal.png';

function JournalEntry({ entry, onDelete }) {
    // Convert timestamp to readable date
    const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <Container className='journal-entry'>
            <Row>
                <img id="journal-image" src={journalImg} alt="Journal" />
                <Col>
                    <div className='journal-summary-content'>
                        <small>{dateStr}</small>
                        <br />
                        <span className='journal-title'>{entry.title}</span>
                        <p>{entry.content}</p>
                    </div> 
                </Col>
                <Col xs="auto">
                    {/* Pass the entry ID to the menu to delete it */}
                    <KebabMenu onDelete={() => onDelete(entry.id)} />
                </Col>
            </Row>
        </Container>
    );
}

export default JournalEntry;