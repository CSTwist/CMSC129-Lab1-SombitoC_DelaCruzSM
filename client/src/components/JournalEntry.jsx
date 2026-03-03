import { useState } from 'react';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import '../styles/JournalEntry.css';
import KebabMenu from '../components/JournalKebabMenu.jsx';
import journalImg from '../assets/journal.png';

function JournalEntry({ entry, onDelete }) {
    const [showModal, setShowModal] = useState(false);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <>
            <Container 
                className='journal-entry'
                onClick={handleOpen}
                role="button"
                tabIndex={0}
            >
                <Row className='rounded'>
                    <img id="journal-image" src={journalImg} alt="Journal" />
                    <Col>
                        <div className='journal-summary-content'>
                            <small>{dateStr}</small>
                            <br />
                            <span className='journal-title'>{entry.title}</span>
                            <p id="journal-summary">{entry.content}</p>
                        </div> 
                    </Col>
                    <Col xs="auto" onClick={(e) => e.stopPropagation()}>
                        <KebabMenu onDelete={() => onDelete(entry.id)} />
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <Modal.Title>{entry.title}</Modal.Title>

                        <div onClick={(e) => e.stopPropagation()}>
                            <KebabMenu id="kebab-menu-view" onDelete={() => onDelete(entry.id)} />
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body>
                    <small>{dateStr}</small>
                    <hr />
                    <p id="journal-content">{entry.content}</p>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default JournalEntry;