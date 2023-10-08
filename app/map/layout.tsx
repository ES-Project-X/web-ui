import {Col, Container, Row} from "react-bootstrap"
export default function MapLayout({children}: { children: React.ReactNode }) {
    return (
        <Container>
            <Row>
                <Col style={{height: "100vh", width: "100vw"}}>
                    {children}
                </Col>
            </Row>
        </Container>
    )
}