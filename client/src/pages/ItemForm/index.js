import React , { Component } from 'react';
import { Button, Card, Form, Heading, Loader } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import Web3  from 'web3';
import { withFirestore } from 'react-firestore';

class ItemForm extends Component {
  state = {
    item: null,
    isEdit: false,
    isLoading: true,
    name:'', image:'', description:'', price:'', numberOfItems:'', priceInEth:''
  };

  componentDidMount = async () => {
    const {accounts, instance} = await getInstance();
    let isEdit = !!this.props.match.params.id;
    this.setState({ accounts, instance, isEdit, isLoading: isEdit }, this.getItem);
    console.log(this.props.firestore)
  }

  getItem(){
    if(this.state.isEdit){
      const { firestore } = this.props;
      const itemId = this.props.match.params.id;
      firestore.doc(`items/${itemId}`).onSnapshot(snapshot => {
        const { name , description , image, priceInWei , numberOfItems} = snapshot.data();
        const price = Web3.utils.fromWei(priceInWei, 'ether')
        console.log(price, priceInWei)
        this.setState({ name , description , image, price , numberOfItems, isLoading: false });
      });
    }
  }

  addUpdateItem = async ()=> {
    const { name , description , image, price , numberOfItems, isEdit } = this.state;
    const itemId = this.props.match.params.id;
    const priceInWei = Web3.utils.toWei(price, 'ether')
    if(!isEdit){
      const collectionRef = this.props.firestore.collection('items');
      const itemRef = await collectionRef.add({
        name , image, description, priceInWei, numberOfItems
      })
      console.log(itemRef)
    }else{
      const documentRef = this.props.firestore.doc(`items/${itemId}`);
      await documentRef.update({name , image, description, priceInWei, numberOfItems })
    }
  }

  handleSubmit = async (e) => {
    this.setState({submitting:true});
    e.preventDefault();
    await this.addUpdateItem();
    console.log(this.state.item)
    this.setState({submitting:false});
  };

  handleValueChange = e => {
    const {name , value} = e.target
    this.setState({[name]:value})
  }

  render() {
    const { isEdit, isLoading } = this.state;
    if(isLoading){
      return <Loader />
    }
    return  <Card>
        <Heading.h2> {isEdit ? 'Update': 'Create'} Item </Heading.h2>
        <Form onSubmit={this.handleSubmit}>
            <Form.Field label="Name" width={1}>
            <Form.Input
                type="text"
                name="name"
                required
                width={1}
                onChange={this.handleValueChange}
                value={this.state.name}
            />
            </Form.Field>
            <Form.Field label="Description" width={1}>
            <Form.Input
                type="text"
                name="description"
                width={1}
                onChange={this.handleValueChange}
                value={this.state.description}
            />
            </Form.Field>
            <Form.Field label="Image Url" width={1}>
            <Form.Input
                type="url"
                name="image"
                required
                width={1}
                onChange={this.handleValueChange}
                value={this.state.image}
            />
            </Form.Field>
            <Form.Field label="Price per Item(ETH)" width={1}>
            <Form.Input
                type="number"
                name="price"
                required
                width={1}
                onChange={this.handleValueChange}
                min="0"
                value={this.state.price}
            />
            </Form.Field>
            <Form.Field label="Number of units" width={1}>
            <Form.Input
                type="number"
                name="numberOfItems"
                required
                width={1}
                onChange={this.handleValueChange}
                min="1"
                value={this.state.numberOfItems}
            />
            </Form.Field>
            <Button type="submit" width={1} disabled={this.state.submitting}>{isEdit ? 'Update': 'Create'}</Button>
        </Form>
      </Card>
  }
}

export default withFirestore(ItemForm);