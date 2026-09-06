from pydantic import BaseModel


class ProductCreate(BaseModel):

    name: str

    category: str

    price: float

    stock: int

    description: str = ""


class OrderCreate(BaseModel):

    customer_name: str

    product_id: int

    quantity: int