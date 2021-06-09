import pytest
from brownie import accounts, reverts
from settings import *

# reset the chain after every test case
@pytest.fixture(autouse=True)
def isolation(fn_isolation):
    pass

def test_max_list(max_list):
    points = 10
    tx = max_list.setPoints([accounts[3]], [points], {"from": accounts[0]})
    assert "PointsUpdated" in tx.events
    assert max_list.hasPoints(accounts[3], points) == True

    assert max_list.isInList(accounts[3]) == True
    assert max_list.maxPoints() == points


# Test cannot initPointList twice
# Test not allowed operator, cannot change
# Test setPoints to an empty account array, and empty amount, and both empty
# Test an array with multiple users, some duplicates accounts different amounts
# Test changing amount, higher, lower, higher and check still correct, and totalPoints correct

def test_init_twice(max_list):
    with reverts("Already initialised"):
        max_list.initPointList(accounts[0], {"from": accounts[0]})

def test_set_points_not_operator(max_list):
    points = 10
    with reverts("MaxList.setPoints: Sender must be operator"):
        max_list.setPoints([accounts[3]], [points], {"from": accounts[5]})
