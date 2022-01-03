import tea
import csv
import os
import pandas as pd

def try_something(num): 
    print("Here we are.")
    import pdb; pdb.set_trace()
    print("After PDB!")
    
    if num > 5: 
        pass
    else: 
        print("Less than 5!")

def do_nothing(): 
    pass

if __name__ == "__main__":
    do_nothing()
    # try_something(1)