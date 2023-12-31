# Generated by Selenium IDE
import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class TestCheckstatstest():
  def setup_method(self, method):
    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def test_checkstatstest(self):
    self.driver.get("http://localhost:3000/map")
    self.driver.set_window_size(1552, 832)
    self.driver.find_element(By.CSS_SELECTOR, ".btn-circle-link:nth-child(1) > .btn").click()
    self.driver.find_element(By.CSS_SELECTOR, "div:nth-child(2) > div > div > .cognito-asf #signInFormUsername").click()
    self.driver.find_element(By.CSS_SELECTOR, "div:nth-child(2) > div > div > .cognito-asf #signInFormUsername").send_keys("kokid46398@rdluxe.com")
    self.driver.find_element(By.CSS_SELECTOR, "div:nth-child(2) > div > div > .cognito-asf #signInFormPassword").click()
    self.driver.find_element(By.CSS_SELECTOR, "div:nth-child(2) > div > div > .cognito-asf #signInFormPassword").send_keys("Sus@naAgui4r")
    self.driver.find_element(By.CSS_SELECTOR, "div:nth-child(2) > div > div > .cognito-asf > .btn").click()
    self.driver.implicitly_wait(10)
    self.driver.find_element(By.CSS_SELECTOR, ".rounded-circle").click()
    self.driver.find_element(By.CSS_SELECTOR, ".bg-primary > .card-header").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-primary > .card-header")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-primary > .card-body").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-primary .card-title")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-success > .card-header").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-success > .card-header")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-success > .card-body").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-success .card-title")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-info > .card-header").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-info > .card-header")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-info .card-title").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-info .card-title")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-warning > .card-header").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-warning > .card-header")
    assert len(elements) > 0
    self.driver.find_element(By.CSS_SELECTOR, ".bg-warning .card-title").click()
    elements = self.driver.find_elements(By.CSS_SELECTOR, ".bg-warning .card-title")
    assert len(elements) > 0
  
if __name__ == '__main__':
    pytest.main()
