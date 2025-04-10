import { render, screen, fireEvent } from "@testing-library/react";
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

//new screen
test('Given a user is on sign up page, when they enter their details, then the log in page should load',async()=>{
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
    fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
    fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
    fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
    fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
    expect(await screen.findByRole('heading',{name: /create account/i})).toBeInTheDocument();
});

