import { render, screen, fireEvent } from "@testing-library/react";
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
//new screen
test('Given a user is on home page, when they enter their details, then the home page should load',async()=>{
    // render(<Login/>);
    render(<Home />);
    expect(screen.getByText(/This will be the home page/i)).toBeInTheDocument();
});