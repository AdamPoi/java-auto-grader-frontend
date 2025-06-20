import { Button } from '@/components/ui/button';
import React from 'react';

interface TestButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ onClick, disabled }) => {
    return (
        <Button onClick={onClick} disabled={disabled}>
            Run Tests
        </Button>
    );
};

export default TestButton;