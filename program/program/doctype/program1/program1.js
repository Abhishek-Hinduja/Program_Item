// Copyright (c) 2024, abhishek and contributors
// For license information, please see license.txt

frappe.ui.form.on('Program1', {
    refresh: function(frm) {
        frm.add_custom_button(__('Add New Item'), function() {
            frm.events.add_new_item(frm);
        });

        frm.add_custom_button(__('Update Item'), function() {
            frm.events.update_item(frm);
        });
    },

    add_new_item: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Add New Item',
            fields: [
                { 
                    fieldname: 'item_group', 
                    label: 'Item Group', 
                    fieldtype: 'Link', 
                    options: 'Item Group', 
                    reqd: 1 
                },
                { 
                    fieldname: 'item', 
                    label: 'Item', 
                    fieldtype: 'Link', 
                    options: 'Item', 
                    reqd: 1,
                    filters: {
                        item_group: function() {
                            return d.get_value('item_group');
                        }
                    },
                    change: function() {
                        let item = d.get_value('item');
                        if (item) {
                            // Fetch item details based on the selected item
                            frappe.call({
                                method: 'frappe.client.get',
                                args: {
                                    doctype: 'Item',
                                    name: item
                                },
                                callback: function(r) {
                                    if (r.message) {
                                        d.set_value('item_name', r.message.item_name);
                                    }
                                }
                            });
                        }
                    }
                },
                { 
                    fieldname: 'item_name', 
                    label: 'Item Name', 
                    fieldtype: 'Data', 
                    read_only: 1 
                },
                { 
                    fieldname: 'quantity', 
                    label: 'Quantity', 
                    fieldtype: 'Int', 
                    reqd: 1 
                },
                { 
                    fieldname: 'finish', 
                    label: 'Finish', 
                    fieldtype: 'Check' 
                },
                { 
                    fieldname: 'description', 
                    label: 'Description', 
                    fieldtype: 'Text', 
                    reqd: 1 
                }
            ],
            primary_action: function(data) {
                // Add item to child table
                let child = frm.add_child('program_items');
                child.item_group = data.item_group;
                child.item = data.item;
                child.item_name = data.item_name;
                child.quantity = data.quantity;
                child.finish = data.finish;
                child.description = data.description;
                frm.refresh_field('program_items');
                d.hide();
            }
        });
    
        d.show();
    },    

    // Function to open Update Item dialog
    update_item: function(frm) {
        // Check if program_items exists and has data
        if (!frm.doc.program_items || frm.doc.program_items.length === 0) {
            frappe.msgprint(__('No items to update.'));
            return;
        }
    
        // Filter Program Items that are not marked as finished
        let options = frm.doc.program_items
            .filter(item => !item.finish)
            .map(item => ({ label: item.item_name, value: item.name }));
    
        if (options.length === 0) {
            frappe.msgprint(__('No items to update.'));
            return;
        }
    
        // Create the dialog for updating the item
        let d = new frappe.ui.Dialog({
            title: 'Update Item',
            fields: [
                { fieldname: 'item', label: 'Item', fieldtype: 'Select', options: options },
                { fieldname: 'quantity', label: 'Quantity', fieldtype: 'Int', reqd: 1 },
                { fieldname: 'finish', label: 'Finish', fieldtype: 'Check' },
                { fieldname: 'description', label: 'Description', fieldtype: 'Text', reqd: 1 }
            ],
            primary_action: function(data) {
                let selected_item = frm.doc.program_items.find(item => item.name === data.item);
                selected_item.quantity = data.quantity;
                selected_item.finish = data.finish;
                selected_item.description = data.description;
                frm.refresh_field('program_items');
                d.hide();
                frm.save();
            }
        });
    
        d.show();
    }
});



