import { useState } from 'react';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import '../styles/JournalEntry.css';
import KebabMenu from '../components/JournalKebabMenu.jsx';
import journalImg from '../assets/journal.png';

function JournalEntry({ entry, onDelete, onEdit }) { // <-- Added onEdit here
    const [showModal, setShowModal] = useState(false);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Helper: Prevent raw Yoopta JSON from showing up on the screen 
    const isRichText = typeof entry.content === 'string' && entry.content.includes('"id"');
    const displayContent = isRichText ? "[Rich text content]" : entry.content;

    return (
        <>
            <Container 
                className='journal-entry'
                onClick={handleOpen}
                role="button"
                tabIndex={0}
            >
                <Row className="rounded">
                    <Col xs="auto">
                        <img id="journal-image" src={journalImg} alt="Journal" />
                    </Col>

                    <Col>
                        <div className='journal-summary-content'>
                            <small>{dateStr}</small>
                            <br />
                            <span className='journal-title'>{entry.title}</span>
                            <div 
                                id="journal-summary"
                                dangerouslySetInnerHTML={{ __html: entry.content }}
                            ></div>
                        </div>
                    </Col>

                    <Col xs="auto" onClick={(e) => e.stopPropagation()}>
                        <KebabMenu 
                            onEdit={() => onEdit(entry)} 
                            onDelete={() => onDelete(entry.id)} 
                        />
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <Modal.Title>{entry.title}</Modal.Title>

                        <div onClick={(e) => e.stopPropagation()}>
                            {/* Passed onEdit down, and closed the view modal before opening the edit modal */}
                            <KebabMenu 
                                id="kebab-menu-view" 
                                onEdit={() => {
                                    handleClose();
                                    onEdit(entry);
                                }}
                                onDelete={() => onDelete(entry.id)} 
                            />
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body>
                    <small className="text-muted">{dateStr}</small>
                    <hr />
                    {/* Note: To fully render Yoopta rich text here instead of plain text, you would use a Yoopta viewer. For now, it will show plain text or the placeholder */}
                    <div 
                        id="journal-content" 
                        style={{ whiteSpace: 'pre-wrap', color: 'black'}} 
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                    ></div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default JournalEntry;