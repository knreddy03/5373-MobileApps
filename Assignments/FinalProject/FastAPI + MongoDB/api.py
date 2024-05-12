# Libraries for FastAPI
from fastapi import FastAPI, Query, File, UploadFile, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response,  FileResponse
from mongoManager import MongoManager
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import PyMongoError  
from typing import List
import base64
import json
import uvicorn
import os
from random import shuffle
from passlib.context import CryptContext
from passlib.hash import bcrypt
from datetime import datetime
import shutil
from fastapi.middleware.cors import CORSMiddleware


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)


class Person(BaseModel):
    firstName: str
    lastName: str 
    email: str
    password: str 

class Candy(BaseModel):
    name: str
    category: str
    description: str
    price: float
    quantity: int
    image_url: str

# Data model for user registration
class UserRegistration(BaseModel):
    first: str
    last: str
    email: str
    password: str

# Data model for user login
class UserLogin(BaseModel):
    email: str
    password: str

class LocationData(BaseModel):
    email: str
    latitude: float
    longitude: float
    timestamp: datetime = datetime.utcnow()



"""
           _____ _____   _____ _   _ ______ ____
     /\   |  __ \_   _| |_   _| \ | |  ____/ __ \
    /  \  | |__) || |     | | |  \| | |__ | |  | |
   / /\ \ |  ___/ | |     | | | . ` |  __|| |  | |
  / ____ \| |    _| |_   _| |_| |\  | |   | |__| |
 /_/    \_\_|   |_____| |_____|_| \_|_|    \____/

The `description` is the information that gets displayed when the api is accessed from a browser and loads the base route.
Also the instance of `app` below description has info that gets displayed as well when the base route is accessed.
"""

description = """🤡
(This description is totally satirical and does not represent the views of any real person alive or deceased. 
And even though the topic is totally macabre, I would love to make anyone who abuses children very much deceased.
However, the shock factor of my stupid candy store keeps you listening to my lectures. If anyone is truly offended
please publicly or privately message me and I will take it down immediately.)🤡


## Description:
Sweet Nostalgia Candies brings you a delightful journey through time with its extensive collection of 
candies. From the vibrant, trendy flavors of today to the cherished, classic treats of yesteryear, 
our store is a haven for candy lovers of all ages (but mostly kids). Step into a world where every shelf and corner 
is adorned with jars and boxes filled with colors and tastes that evoke memories and create new ones. 
Whether you're seeking a rare, retro candy from your childhood or the latest sugary creation, Sweet 
Nostalgia Candies is your destination. Indulge in our handpicked selection and experience a sweet 
escape into the world of confectionery wonders! And don't worry! We will watch your kids!! (😉)

#### Contact Information:

- **Address:** 101 Candy Lane, Alcatraz Federal Penitentiary, San Francisco, CA 94123.
- **Phone:** (123) 968-7378 [or (123 you-perv)]
- **Email:** perv@kidsinvans.com
- **Website:** www.kidsinvans.fun

"""

# Needed for CORS
# origins = ["*"]


# This is the `app` instance which passes in a series of keyword arguments
# configuring this instance of the api. The URL's are obviously fake.
app = FastAPI(
    title="KidsInVans.Fun🤡",
    description=description,
    version="0.0.1",
    terms_of_service="http://www.kidsinvans.fun/worldleterms/",
    contact={
        "name": "KidsInVans.Fun",
        "url": "http://www.kidsinvans.fun/worldle/contact/",
        "email": "perv@www.kidsinvans.fun",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)


# Allow all origins for testing (be cautious with this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


"""
  _      ____   _____          _         _____ _                _____ _____ ______  _____
 | |    / __ \ / ____|   /\   | |       / ____| |        /\    / ____/ ____|  ____|/ ____|
 | |   | |  | | |       /  \  | |      | |    | |       /  \  | (___| (___ | |__  | (___
 | |   | |  | | |      / /\ \ | |      | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
 | |___| |__| | |____ / ____ \| |____  | |____| |____ / ____ \ ____) |___) | |____ ____) |
 |______\____/ \_____/_/    \_\______|  \_____|______/_/    \_\_____/_____/|______|_____/

This is where you will add code to load all the countries and not just countries. Below is a single
instance of the class `CountryReader` that loads countries. There are 6 other continents to load or
maybe you create your own country file, which would be great. But try to implement a class that 
organizes your ability to access a countries polygon data.
"""

mm = MongoManager(db='candy_store')
mm.setDb('candy_store')

"""
  _      ____   _____          _        __  __ ______ _______ _    _  ____  _____   _____
 | |    / __ \ / ____|   /\   | |      |  \/  |  ____|__   __| |  | |/ __ \|  __ \ / ____|
 | |   | |  | | |       /  \  | |      | \  / | |__     | |  | |__| | |  | | |  | | (___
 | |   | |  | | |      / /\ \ | |      | |\/| |  __|    | |  |  __  | |  | | |  | |\___ \
 | |___| |__| | |____ / ____ \| |____  | |  | | |____   | |  | |  | | |__| | |__| |____) |
 |______\____/ \_____/_/    \_\______| |_|  |_|______|  |_|  |_|  |_|\____/|_____/|_____/

This is where methods you write to help with any routes written below should go. Unless you have 
a module written that you include with statements above.  
"""



"""
  _____   ____  _    _ _______ ______  _____
 |  __ \ / __ \| |  | |__   __|  ____|/ ____|
 | |__) | |  | | |  | |  | |  | |__  | (___
 |  _  /| |  | | |  | |  | |  |  __|  \___ \
 | | \ \| |__| | |__| |  | |  | |____ ____) |
 |_|  \_\\____/ \____/   |_|  |______|_____/

 This is where your routes will be defined. Routes are just python functions that retrieve, save, 
 delete, and update data. How you make that happen is up to you.
"""


@app.get("/")
async def docs_redirect():
    """Api's base route that displays the information created above in the ApiInfo section."""
    return RedirectResponse(url="/docs")


@app.get("/candies")
def list_all_candies():
    """
    Retrieve a list of all candies available in the store.
    """
    mm.setCollection('candies')
    result = mm.get()
    return result


@app.get("/categories")
def list_all_categories():
    """
    Retrieve a list of all candies available in the store.
    """    
    mm.setCollection("categories")
    
    # Get all categories
    categories = mm.get(filter = {"name"})
    
    # Check if categories were found
    if categories:
        return categories
    else:
        # Return 404 Not Found if no categories were found
        raise HTTPException(status_code=404, detail="Categories not found")


@app.get("/candies/category/{category}")
def candies_by_category(category: str):
    """
    Search for candies based on a query string (e.g., name, category, flavor).
    """
    mm.setCollection('candies')
    result = mm.get(
        query = {"category":category},
        filter = {"_id":0,"name":1,"count":1})
    return result


@app.get("/candies/id/{id}")
def get_candy_by_id(id: str):
    """
    Get detailed information about a specific candy.
    """
    mm.setCollection('candies')
    result = mm.get(query = {"id": id},
    filter={"id": 0, "name": 1, "price": 1, "category": 1})
    return result


@app.get("/candies/price")
def candies_by_price_range(min_price: float = Query(..., gt=0), max_price: float = Query(..., gt=0)):
    mm.setCollection("candies")
    return mm.get(
        query={"price": {"$gte": min_price, "$lte": max_price}},
        filter={"_id": 0, "name": 1, "price": 1, "category": 1},
    )


@app.get("/image")
def get_image(img_id:str):
    mm.setCollection('candies')
    result = mm.get(query = {'id':img_id})

    return FileResponse(result['data']['img_url'])


# Route to fetch all users
@app.get("/users")
def get_all_users():
    """
    Retrieve all users from the database.
    """
    # Set the collection to the users collection
    mm.setCollection("users")
    
    # Retrieve all users from the database
    users_result = mm.get()
    
    if users_result.get("success", False):
        # Extract user data from the result
        users_data = users_result.get("data", [])
        return users_data
    else:
        # Handle error case
        return {"error": "Failed to retrieve users"}


@app.get("/user/{email}")
def get_user_by_email(email: str):
    """
    Retrieve user details by email address.
    """
    # Initialize the MongoDB manager and set the collection to users
    mm = MongoManager(db="candy_store", collection="users")
    
    # Find the user by email and omit sensitive information like the password
    user = mm.find_user_by_email(email)

    if user:
        # If user is found, return the user details
        return user
    else:
        # Raise an HTTP exception if the user is not found
        raise HTTPException(status_code=404, detail="User not found")


@app.post("/register")
def register(user: UserRegistration):
    mm = MongoManager(db='candy_store', collection='users')
    return mm.register_user(user.dict())


@app.post("/login")
def login(user: UserLogin):
    mm = MongoManager(db='candy_store', collection='users')
    return mm.login_user(user.email, user.password)


@app.post("/post-location")
def post_location(location: LocationData):
    """
    Insert a new location into the 'locations' collection, ensuring only one location per user.
    """
    mm.setCollection("locations")

    # Insert or update location using 'upsert' to avoid multiple locations for the same user
    result = mm.add_location(
        email=location.email,
        latitude=location.latitude,
        longitude=location.longitude,
        timestamp=location.timestamp
        )

    if result.get("success", False):
        return {"message": "Location posted successfully"}
    else:
        raise HTTPException(status_code=500, detail=result.get("message", "Failed to post location"))


@app.get("/location/{email}")
def get_user_location_by_email(email: str):
    """
    Get all locations for a specific user by email.
    """
    # Initialize the MongoDB manager and set the collection to locations
    mm = MongoManager(db="candy_store", collection="locations")

    # Retrieve location for the given email, sorted by timestamp
    location = mm.find_user_location(email)

    if location:
        return location
    else:
        raise HTTPException(status_code=404, detail="No locations found for this email")


@app.get("/locations/within-radius")
def get_locations_within_radius(latitude: float, longitude: float, radius: float):
    """
    Get all locations within a given radius from specified latitude and longitude.
    """
    mm.setCollection("locations")

    # Retrieve all locations within the specified radius
    locations = mm.get_locations_within_radius(latitude, longitude, radius)

    if locations:
        return locations
    else:
        raise HTTPException(status_code=404, detail="No locations found within the specified radius")


@app.get("/locations")
def get_all_locations():
    """
    Retrieve all locations from the 'locations' collection.
    """
    mm.setCollection("locations")

    # Get all locations
    all_locations = mm.get()

    if all_locations.get("success", False):
        users_locations = all_locations.get("data", [])
        return users_locations
    else:
        raise HTTPException(status_code=404, detail="No locations found")


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    image_directory = "./uploaded_images/"
    os.makedirs(image_directory, exist_ok=True)  # Ensure directory exists

    file_path = os.path.join(image_directory, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)  # Save the file to the filesystem
        file.file.close()  # Close the file stream after use

        # Save image metadata to MongoDB
        mm.setCollection("images")
        inserted_id = mm.save_image(file_path, {"filename": file.filename})

        if inserted_id:
            return {"message": "Image uploaded successfully", "image_id": str(inserted_id)}
        else:
            raise HTTPException(status_code=500, detail="Failed to save image in the database")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during image upload: {str(e)}")
    

@app.get("/images/{image_id}")
async def get_image(image_id: str):
    mm = MongoManager(db="candy_store", collection="images")

    try:
        image_metadata = mm.get_image(image_id)
        
        if not image_metadata:
            raise HTTPException(status_code=404, detail="Image not found in the database.")

        file_path = image_metadata.get("path")

        if not file_path or not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="Image file not found on the server.")
        
        return FileResponse(file_path)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving image: {str(e)}")


@app.get("/images")
def get_all_images():
    mm.setCollection("images")
    
    try:
        images_result = mm.get()
        if images_result.get("success", False):
            all_images = images_result.get("data", [])
            return all_images
        else:
            raise HTTPException(status_code=500, detail="Error retrieving images from the database.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving all images: {str(e)}")
   

@app.post("/candies")
def add_new_candy(candy: Candy):
    """
    Add a new candy to the store's inventory.
    """
    mm.setCollection("candies")
    candy_dict = candy.dict()
    mm.post(candy_dict)
    return {"message": "Candy added successfully"}


@app.put("/candies/{candy_id}")
def update_candy_info(candy_id: str):
    """
    Update information about an existing candy.
    """
    mm.setCollection('candies')
    result = mm.update(query={"id": candy_id})
    if result:
        return {"message": "Candy info update failed"}
    else:
        return {"message": "Candy info updated successfully"} 

@app.delete("/candies/{candy_id}")
def delete_candy(candy_id: str):
    """
    Remove a candy from the store's inventory by its ID.
    """
    mm.setCollection("candies")
    result = mm.delete(query={"_id": candy_id})

    if result["success"]:
        return {"message": "Candy deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=result["message"])        


"""
This main block gets run when you invoke this file. How do you invoke this file?

        python api.py 

After it is running, copy paste this into a browser: http://127.0.0.1:8080 

You should see your api's base route!

Note:
    Notice the first param below: api:app 
    The left side (api) is the name of this file (api.py without the extension)
    The right side (app) is the bearingiable name of the FastApi instance declared at the top of the file.
"""
if __name__ == "__main__":
    #gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:main --bind 0.0.0.0:8000 --keyfile=./key.pem --certfile=./cert.pem

    # uvicorn.run("api:app", host="kidsinvans.fun", port=8080, log_level="debug", reload=True)

    uvicorn.run(
        "api:app",
        host="159.223.206.83",  # Use 0.0.0.0 to bind to all network interfaces
        #port=443,  # Standard HTTPS port
        port=8084,  # Standard HTTPS port
        log_level="debug",
        reload=True
    )
