========
Tutorial
========

The following tutorial will walk help you to create a `Tethys <https://docs.tethysplatform.org/en/stable/>`_  application that retrieves stations from a `HydroServer <https://hydroserver2.github.io/hydroserver/guide/getting-started.html>`_ instance 
and, it saves reaches from the `GEOGloWS ECMWF Streamflow Service <https://geoglows.ecmwf.int/documentation>`_ into a local PostgreSQL application.


Requirements
------------

- tethys-platform installed locally in the development environment.
- Any Text Editor

Getting Started
---------------

Please create an scaffold of the app using the following command:

.. code-block:: bash


    conda activate tethys
    tethys scaffold hydroserver_client
    tethys install -d


The following will create a start up project, that we will need to clean, please copy the following contents to the following files:
the `home.html` should be the following:

.. code-block:: html


    {% extends "hydroserver_client/base.html" %}

    {% block header_buttons %}
    <div class="header-button glyphicon-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Help">
    <a data-bs-toggle="modal" data-bs-target="#help-modal"><i class="bi bi-question-circle"></i></a>
    </div>
    {% endblock %}

    {% block app_content %}

    {% endblock %}

    {# Use the after_app_content block for modals #}
    {% block after_app_content %}
    <!-- Example Modal -->
    <div class="modal fade" id="help-modal" tabindex="-1" role="dialog" aria-labelledby="help-modal-label">
    <div class="modal-dialog" role="document">
    <div class="modal-content">
    <div class="modal-header">
    <h5 class="modal-title" id="help-modal-label">Example Modal</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
    <p>You can add custom buttons to the app header using the <code>header_buttons</code> block. Use anchor/link tags for the button and wrap it in a div with the class <code>header-button</code>. For buttons with the gliphyicons, add the <code>glyphicon-button</code> class as well.</p>
    <p>Ever have trouble using a modal in a Tethys app? Use the <code>after_app_content</code> block for modal content to allow them to function properly. See: <a href="https://getbootstrap.com/docs/5.1/components/modal/">Bootstrap Modals</a></p>
    <p>Add tooltips to any element by adding the <code>data-bs-toggle</code>, <code>data-bs-placement</code>, and <code>title</code> attributes to the button. See: <a href="https://getbootstrap.com/docs/5.1/components/tooltips/">Bootstrap Tooltips</a></p>
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
    </div>
    </div>
    </div>
    </div>
    {% endblock %}

    {% block app_actions %}

    {% endblock %}





To install the project, follow these steps:

1. Clone the repository from GitHub:

   .. code-block:: bash

      git clone https://github.com/Aquaveo/hdyroserver_client_tutorial.git

2. Navigate to the project directory:

   .. code-block:: bash

      cd your_project

3. Install dependencies using pip:

   .. code-block:: bash

      pip install -r requirements.txt

Usage
-----

To use the project:

1. Run the main script:

   .. code-block:: bash

      python main.py

2. Follow the on-screen instructions.

Configuration
-------------

The project configuration can be customized by editing the `config.ini` file.

Contributing
------------

If you want to contribute to this project, please follow the guidelines in the `CONTRIBUTING.md` file.

Credits
-------

This project was created by [Your Name](https://github.com/your_username).

License
-------

This project is licensed under the MIT License. See the `LICENSE` file for details.
