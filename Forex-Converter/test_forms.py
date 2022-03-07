
from unittest import *
from app import app
from forex_python.converter import CurrencyRates, CurrencyCodes
from forms import *


c_codes = CurrencyCodes()
c_rates = CurrencyRates()

class FlaskTests(TestCase):
    def setUp(self):
        """Stuff to do before every test."""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_home_page(self):
        """tests that we load the home page properly with a 200 status code"""
        resp = self.client.get('/')
        self.assertEquals(resp.status_code, 200)
        # html = resp.get_data(as_text=True)
        ## want to check if form action type ##

    def test_form_check_route(self):
        """tests that we get a 404 page if user tries to access /form-check directly"""
        resp = self.client.get('/form-check')
        self.assertEquals(resp.status_code, 404)
        


class FormFuncTests(TestCase):

    def test_validate_curr(self):
        """This is a test whether we have valid currencies to convert from and to"""

        ## test validate currency from ##
        self.assertEqual(validate_curr_from("USD"), True) ## we expect both to be True because USD is supported
        self.assertFalse(validate_curr_from("BDT")) ## since BDT is not supported, validate should be false

        ##test validate currency to ##
        self.assertEqual(validate_curr_to("USD"), True)
        self.assertFalse(validate_curr_to("BDT"))

    def test_validate_amount(self):
        """This is a test to validate input types for amount"""

        ## input types tests ##
        self.assertEqual(validate_amount_type(4.3), True)
        self.assertEqual(validate_amount_type(4), True)

        ##since two is a non-numerical str which can't be converted to a number, we expect this to be False
        self.assertFalse(validate_amount_type("two")) 

    
    def test_calc_converted_curr(self):
        """test to verify correct currency conversion calculations"""
        dollar_symbol = c_codes.get_symbol("USD")
        euro_symbol = c_codes.get_symbol("EUR")
        ## check that one dollar and one euro stays the same 
        self.assertEqual(calc_converted_curr("USD","USD", 1), f"The result is {dollar_symbol} 1.00")
        self.assertEqual(calc_converted_curr("EUR","EUR", 1), f"The result is {euro_symbol} 1.00")