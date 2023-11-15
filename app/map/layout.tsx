import {Col, Container, Row} from "react-bootstrap"
export default function MapLayout({children}: { children: React.ReactNode }) {
    return (
        <Container fluid={true}>
            <Row>
                <Col style={{height: "100vh", width: "100vw", overflow: "hidden", padding: 0}}>
                    {children}
                </Col>
            </Row>
        </Container>
    )
}