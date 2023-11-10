// userProfile.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../../app/components/UserProfile'; // Update the path accordingly

describe('UserProfile Component', () => {
  const mockUser = {
    // Mock user data
    username: 'testUser',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    image_url: 'https://example.com/avatar.jpg',
  };

  test('renders UserProfile component', () => {
    render(<UserProfile user={mockUser} />);

    // Check if the component renders without crashing
    expect(screen.getByText('testUser')).toBeInTheDocument();
  });


});
