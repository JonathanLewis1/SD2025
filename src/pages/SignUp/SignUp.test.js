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

//Empty firstname
test('Given a user is on sign up page, when they enter with empty firstname, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
    fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
    fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
    fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
});

//empty last name
test('Given a user is on sign up page, when they enter with empty last name, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
    fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
    fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
    fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
    expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
});

//Empty email
test('Given a user is on sign up page, when they enter with empty email, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
    fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
    fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
    fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
});

//empty password
test('Given a user is on sign up page, when they enter with empty password, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
    fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
    fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
    fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
});