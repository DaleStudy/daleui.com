import { Card, Flex } from "daleui";

export default function FlexAlign() {
  return (
    <Flex gap="16">
      <Card outline>
        <Card.Body>
          <Card.Title>개인</Card.Title>
          <Card.Description>
            혼자 쓰는 프로젝트에 맞는 최소 구성입니다.
          </Card.Description>
        </Card.Body>
      </Card>
      <Card outline>
        <Card.Body>
          <Card.Title>팀</Card.Title>
          <Card.Description>
            멤버 초대와 권한 관리, 감사 로그를 포함합니다. 설명이 길어져도 두
            카드의 높이는 같습니다.
          </Card.Description>
        </Card.Body>
      </Card>
    </Flex>
  );
}
