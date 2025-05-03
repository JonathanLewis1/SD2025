// //Mock-React Router navigation
// const mockNavigate=jest.fn();
// jest.mock('react-router-dom',()=>({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate:()=>mockNavigate,
// }));

// //Mock-Firebase authentication and database module
// jest.mock('../../firebase',()=>({
//     auth:{},
//     db:{},
// }));

// //Store references to these so we can override them per test
// const mockCreateUserWithEmailAndPassword=jest.fn();
// const mockSendEmailVerification=jest.fn();
// const mockGetDoc=jest.fn();
// const mockSetDoc=jest.fn();

// jest.mock('firebase/auth',()=>({
//     createUserWithEmailAndPassword: (...args)=>mockCreateUserWithEmailAndPassword(...args),
//     sendEmailVerification: (...args)=>mockSendEmailVerification(...args),
//     signOut: jest.fn(),
// }));

// jest.mock('firebase/firestore',()=>({
//     doc:jest.fn(()=>({})),
//     getDoc:(...args)=>mockGetDoc(...args),
//     setDoc:(...args)=>mockSetDoc(...args),
// }));

// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import SignUp from './SignUp';
// import { BrowserRouter } from 'react-router-dom';

// const renderWithRouter = (ui)=> render(<BrowserRouter>{ui}</BrowserRouter>);

// //Valid signup
// test('Given a user fills in valid details on sign up page, when they submit the form, then they are navigated to login page',async ()=>{
//     mockCreateUserWithEmailAndPassword.mockResolvedValue({user:{uid:'newuser123'}});
//     mockSendEmailVerification.mockResolvedValue();
//     mockSetDoc.mockResolvedValue();
  
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/first name/i),{target:{value:'John'}});
//     fireEvent.change(screen.getByPlaceholderText(/last name/i),{target:{value:'Doe'}});
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'newuser@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target:{value:'password123'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     await waitFor(()=>{
//       expect(mockNavigate).toHaveBeenCalledWith('/login');
//     });
// });

// //Empty firstname
// test('Given a user is on sign up page, when they enter with empty firstname, then an error message sould display',async ()=>{
//     // render(<Login/>);
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
// });

// //Empty last name
// test('Given a user is on sign up page, when they enter with empty last name, then an error message sould display',async ()=>{
//     // render(<Login/>);
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
// });

// //Empty email
// test('Given a user is on sign up page, when they enter with empty email, then an error message sould display',async ()=>{
//     // render(<Login/>);
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
//     fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
// });

// //Empty password
// test('Given a user is on sign up page, when they enter with empty password, then an error message sould display',async ()=>{
//     // render(<Login/>);
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/first name/i),{target: {value:'firstname'}});
//     fireEvent.change(screen.getByPlaceholderText(/last name/i),{target: {value:'lastname'}});
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'correct@buyer.com'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
// });

// //Email already signed up
// test('Given a user is on the sign up page, when they eneter an email already in use, then an error message should display',async ()=>{
//     mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));
//     renderWithRouter(<SignUp />);
//     fireEvent.change(screen.getByPlaceholderText(/first name/i),{target:{value:'John'}});
//     fireEvent.change(screen.getByPlaceholderText(/last name/i),{target:{value:'Doe'}});
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'existing@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target:{value:'password123'}});
//     fireEvent.click(screen.getByRole('button',{name:/sign up/i}));
//     expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
//   });

// //Correct Seller and Buyer role updates in dropdown   
// test('Given a user is on sign up page, when they change the role, then it updates the role state', async () => {
//     mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'test123' } });
//     mockSendEmailVerification.mockResolvedValue();
//     mockSetDoc.mockResolvedValue();

//     renderWithRouter(<SignUp />);
//     const select = screen.getByLabelText(/role/i);
//     fireEvent.change(select, { target: { value: 'seller' } });
//     fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'Jane' } });
//     fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
//     fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jane@example.com' } });
//     fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
//     fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
//     await waitFor(() => {
//         expect(mockNavigate).toHaveBeenCalledWith('/login');
//     });
// });
test.todo('should render correct component based on route');