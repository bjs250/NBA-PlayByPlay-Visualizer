import subprocess
import sys

# Read in the Game ID from the command line
game_id = ""
if len(sys.argv) == 2:
    game_id = str(sys.argv[1])
else:
    raise Exception("Wrong number of input arguments : " + str(len(sys.argv)))

print("\tGetting BoxScore data")
cmd = ['python', 'getBoxScoreData.py', game_id]
subprocess.Popen(cmd).wait()

print("\tGetting PlayByPlay data")
cmd = ['python', 'getPlayByPlayData.py', game_id]
subprocess.Popen(cmd).wait()

print("\tCleaning data")
cmd = ['python', 'cleanData.py', game_id]
subprocess.Popen(cmd).wait()
print("\tDone")