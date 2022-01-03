import numpy as np 


def break_ties(arr, ranks):
    new_ranks = np.copy(ranks)
    assert(isinstance(ranks, np.ndarray))

    counts = np.bincount(ranks)
    assert(counts[0] == 0) # There shouldn't be any elts in ranks with rank 0

    # Go through counts of ranks
    for i in range(counts): 
        # If there are multiple elts with the same rank
        if counts[i] > 1:
            # Find the elt with the rank and break the tie
            for j in range(ranks):
                if ranks[j] == i: 
                    new_ranks[j] = ranks[j]/counts[i] # divide by the number of elts that have that same rank
    
    return new_ranks

def sort_with_ties(arr):
    pass

def rank(arr):

    tmp = arr.argsort() # Returns numpy array of indices ordering their elts
    ranks = np.empty_like(tmp)
    ranks[tmp] = np.arange(len(arr))

    # If there are ties
    if len(set(arr)) != len(arr):
        # Go through and recompute ranks for elts with the same value
        # Get unique elts
        unique_elts = np.unique(arr)

        for e in range(len(unique_elts)):
            idxs = np.where(arr == unique_elts[e])[0] # list of indices for each elt
            # Update ranks
            if len(idxs) > 1: 
                rank_sum = np.sum(ranks[idxs])
                new_rank = rank_sum/len(idxs)
                ranks = ranks.astype('float64') # to allow for new_rank
                ranks[idxs] = new_rank

    return ranks

arr0 = np.array([1, 10, 12, 10,6,8,3])
# arr0 = np.array([10, 10, 1])
ranks = rank(arr0)
import pdb; pdb.set_trace()