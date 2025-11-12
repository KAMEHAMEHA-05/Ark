from os import listdir

def note_extract(file_name):
    for x in listdir('./Notes'):
        print(x)
        if file_name in x:
            with open(f'./Notes/{x}', 'r') as file:
                content = file.read()
            return content