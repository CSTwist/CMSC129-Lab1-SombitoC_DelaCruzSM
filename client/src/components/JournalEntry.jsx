import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import '../styles/JournalEntry.css';
import KebabMenu from '../components/JournalKebabMenu.jsx';
import journalImg from '../assets/journal.png';

function JournalEntry(){
    return (
        <Container className='journal-entry'>
            <Row>
                <img id="journal-image" src={journalImg} alt="Journal" />

                <Col>
                {/* Replace this with dynamic journal summary*/}
                    <div className='journal-summary-content'>
                        MM/DD/YYYY
                        <br />
                        <span className='journal-title'>Lorem ipsum dolor set</span>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </div> 
                </Col>

                <Col xs="auto">
                    <KebabMenu />
                </Col>
            </Row>

        </Container>
    );
}

export default JournalEntry