import * as React from "react";
import styled from "styled-components";

export const View = styled.div`
  height: 100%;
  overflow: auto;
  padding: 50px;
  box-sizing: border-box;
`;

const FullscreenTextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Title = styled.span`
  background: #000;
  color: #fff;
  font-size: 100px;
`;

export const Subtitle = styled(Title)`
  background: #000;
  color: #fff;
  font-size: 30px;
`;

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function FullscreenText({ children, className }: IProps) {
  return (
    <FullscreenTextContainer className={className}>
      {children}
    </FullscreenTextContainer>
  );
}
