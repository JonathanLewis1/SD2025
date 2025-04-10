import { render, screen, fireEvent} from "@testing-library/react";
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// const mockNavigate = jest.fn();
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: () => mockNavigate,
//   }));
  

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
// new screen
// test('Given a user is on login page, when they enter their details, then the home page should load',async()=>{
//     // render(<Login/>);
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     // expect(await screen.findByRole('heading',{name: /This will be the home page/i})).toBeInTheDocument();
//     expect(await screen.findByText(/this will be the home page/i)).toBeInTheDocument();

// });

// invalid details
// test('Given a user is on login page, when they enter invalid details, then an error message should display',async ()=>{
//     // render(<Login/>);
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'wrong@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'invalid'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     // expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument(); 
//     await waitFor(() =>
//         expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
//       );
          
// });

//Empty email
test('Given a user is on login page, when they enter with empty email, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'invalid'}});
    fireEvent.click(screen.getByRole('button',{name:/log in/i}));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
});

//empty password
test('Given a user is on login page, when they enter with empty password, then an error message sould display',async ()=>{
    // render(<Login/>);
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'wrong@email.com'}});
    fireEvent.click(screen.getByRole('button',{name:/log in/i}));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
});

// Hideen password
test('Given a user is on login page, when they enter their password, then the password should be hidden',()=>{
    // render(<Login/>);
    renderWithRouter(<Login />);
    const passwordInp=screen.getByPlaceholderText(/password/i);
    expect(passwordInp).toHaveAttribute('type','password');
});