package com.catvac.app.ui.catdetail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.catvac.app.R
import com.catvac.app.ui.components.VaccineRow
import com.catvac.app.ui.components.VaccineRowSkeleton
import com.catvac.app.ui.components.ShimmerBox
import com.catvac.app.util.formatDueDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatDetailScreen(
    catId: String,
    navController: NavController,
    viewModel: CatDetailViewModel,
) {
    val state by viewModel.state.collectAsState()
    val snackbarMsg by viewModel.snackbar.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(snackbarMsg) {
        snackbarMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbar()
        }
    }

    LaunchedEffect(catId) {
        viewModel.load(catId)
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            val title = when (val s = state) {
                is CatDetailUiState.Success -> s.cat.name
                else -> stringResource(R.string.cat_default)
            }
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, stringResource(R.string.action_back))
                    }
                },
            )
        },
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = viewModel.isRefreshing.collectAsState().value,
            onRefresh = { viewModel.refresh(catId) },
            modifier = Modifier.fillMaxSize().padding(padding),
        ) {
            when (val s = state) {
                is CatDetailUiState.Loading -> {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            ShimmerBox(width = 56, height = 56, shape = CircleShape)
                            Spacer(Modifier.width(12.dp))
                            Column {
                                ShimmerBox(height = 22, width = 160)
                                Spacer(Modifier.height(6.dp))
                                ShimmerBox(height = 14, width = 100)
                            }
                        }
                        Spacer(Modifier.height(32.dp))
                        ShimmerBox(height = 22, width = 100)
                        Spacer(Modifier.height(12.dp))
                        repeat(3) { VaccineRowSkeleton(); Spacer(Modifier.height(8.dp)) }
                    }
                }
                is CatDetailUiState.Error -> {
                    Column(
                        Modifier.fillMaxSize().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Text(s.message)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { viewModel.load(catId) }) {
                            Text(stringResource(R.string.dashboard_retry))
                        }
                    }
                }
                is CatDetailUiState.Success -> {
                    CatDetailContent(
                        catId = catId,
                        cat = s.cat,
                        vaccines = s.vaccines,
                        viewModel = viewModel,
                        navController = navController,
                    )
                }
            }
        }
    }
}

@Composable
private fun CatDetailContent(
    catId: String,
    cat: com.catvac.app.data.model.CatDto,
    vaccines: List<com.catvac.app.data.model.VaccineDto>,
    viewModel: CatDetailViewModel,
    navController: NavController,
) {
    var showEdit by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var showAddVax by remember { mutableStateOf(false) }
    var deleteVaxId by remember { mutableStateOf<String?>(null) }
    var editVaxId by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
    ) {
        item {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
            ) {
                val avatarInitial = cat.name.first().uppercase()
                if (cat.photoUrl != null) {
                    AsyncImage(
                        model = cat.photoUrl,
                        contentDescription = stringResource(R.string.cat_avatar_description, cat.name),
                        modifier = Modifier.size(56.dp).clip(CircleShape),
                        contentScale = ContentScale.Crop,
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = avatarInitial,
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        cat.name,
                        style = MaterialTheme.typography.headlineMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    val subtitle = listOfNotNull(cat.breed, cat.sex)
                        .joinToString(" · ")
                        .ifEmpty { stringResource(R.string.cat_default) }
                        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row {
                    IconButton(onClick = { showEdit = true }) {
                        Icon(Icons.Outlined.Edit, stringResource(R.string.vaccine_edit))
                    }
                    IconButton(onClick = { showDeleteConfirm = true }) {
                        Icon(Icons.Outlined.Delete, stringResource(R.string.vaccine_delete), tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }

        item {
            // Vaccines
            Text(
                stringResource(R.string.detail_vaccines),
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(bottom = 12.dp),
            )
        }

        if (vaccines.isEmpty()) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        stringResource(R.string.detail_empty_vaccines),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        stringResource(R.string.detail_empty_vaccines_body),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        } else {
            items(vaccines, key = { it.id }) { vax ->
                VaccineRow(
                    vaccine = vax,
                    onAdminister = { viewModel.administerVaccine(vax.id, catId) },
                    onSnooze = { days -> viewModel.snoozeVaccine(vax.id, catId, days) },
                    onEdit = { editVaxId = vax.id },
                    onDelete = { deleteVaxId = vax.id },
                    modifier = Modifier.padding(bottom = 8.dp),
                )
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            OutlinedButton(
                onClick = { showAddVax = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Outlined.Add, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text(stringResource(R.string.detail_add_vaccine))
            }
        }
    }

    if (showEdit) {
        EditCatDialog(
            catName = cat.name,
            catBreed = cat.breed ?: "",
            catSex = cat.sex ?: "",
            catNotes = cat.notes ?: "",
            onDismiss = { showEdit = false },
            onSubmit = { name, breed, sex, notes ->
                viewModel.updateCat(catId, name, breed, sex, notes)
                showEdit = false
            },
        )
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text(stringResource(R.string.delete_cat_title)) },
            text = {
                Text(stringResource(R.string.delete_cat_body, cat.name))
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirm = false
                        viewModel.deleteCat(catId) {
                            navController.popBackStack()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error,
                    ),
                ) { Text(stringResource(R.string.vaccine_delete)) }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) { Text(stringResource(R.string.action_cancel)) }
            },
        )
    }

    if (showAddVax) {
        AddVaccineDialog(
            onDismiss = { showAddVax = false },
            onSubmit = { name, dueDate, intervalMonths, notes ->
                viewModel.addVaccine(catId, name, dueDate, intervalMonths, notes)
                showAddVax = false
            },
        )
    }

    editVaxId?.let { vaxId ->
        val vax = vaccines.firstOrNull { it.id == vaxId }
        if (vax != null) {
            EditVaccineDialog(
                vaccineName = vax.name,
                vaccineDueDate = vax.dueDate,
                vaccineIntervalMonths = vax.intervalMonths,
                vaccineNotes = vax.notes,
                onDismiss = { editVaxId = null },
                onSubmit = { name, dueDate, intervalMonths, notes ->
                    viewModel.updateVaccine(vaxId, catId, name, dueDate, intervalMonths, notes)
                    editVaxId = null
                },
            )
        }
    }

    deleteVaxId?.let { vaxId ->
        AlertDialog(
            onDismissRequest = { deleteVaxId = null },
            title = { Text(stringResource(R.string.delete_vaccine_title)) },
            text = { Text(stringResource(R.string.delete_vaccine_body)) },
            confirmButton = {
                Button(
                    onClick = {
                        deleteVaxId = null
                        viewModel.deleteVaccine(vaxId, catId)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error,
                    ),
                ) { Text(stringResource(R.string.vaccine_delete)) }
            },
            dismissButton = {
                TextButton(onClick = { deleteVaxId = null }) { Text(stringResource(R.string.action_cancel)) }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditCatDialog(
    catName: String,
    catBreed: String,
    catSex: String,
    catNotes: String,
    onDismiss: () -> Unit,
    onSubmit: (name: String, breed: String, sex: String, notes: String) -> Unit,
) {
    var name by remember { mutableStateOf(catName) }
    var breed by remember { mutableStateOf(catBreed) }
    var sex by remember { mutableStateOf(catSex) }
    var notes by remember { mutableStateOf(catNotes) }
    var expanded by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(stringResource(R.string.edit_cat_title), style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(4.dp))
            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text(stringResource(R.string.cat_name_label)) }, singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = breed, onValueChange = { breed = it },
                label = { Text(stringResource(R.string.cat_breed_label)) }, singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = it },
            ) {
                OutlinedTextField(
                    value = when (sex) {
                        "M" -> stringResource(R.string.sex_male)
                        "F" -> stringResource(R.string.sex_female)
                        else -> ""
                    },
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.cat_sex_label)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable),
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                ) {
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_not_set)) }, onClick = { sex = ""; expanded = false })
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_male)) }, onClick = { sex = "M"; expanded = false })
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_female)) }, onClick = { sex = "F"; expanded = false })
                }
            }
            OutlinedTextField(
                value = notes, onValueChange = { notes = it },
                label = { Text(stringResource(R.string.cat_notes_label)) }, maxLines = 3,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) { Text(stringResource(R.string.action_cancel)) }
                Spacer(Modifier.width(8.dp))
                Button(onClick = { if (name.isNotBlank()) onSubmit(name, breed, sex, notes) },
                    enabled = name.isNotBlank()) { Text(stringResource(R.string.action_save)) }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditVaccineDialog(
    vaccineName: String,
    vaccineDueDate: String,
    vaccineIntervalMonths: Int?,
    vaccineNotes: String?,
    onDismiss: () -> Unit,
    onSubmit: (name: String, dueDate: String, intervalMonths: Int?, notes: String?) -> Unit,
) {
    var name by remember { mutableStateOf(vaccineName) }
    var dueDate by remember { mutableStateOf(vaccineDueDate) }
    var intervalMonths by remember { mutableStateOf(vaccineIntervalMonths?.toString() ?: "") }
    var notes by remember { mutableStateOf(vaccineNotes ?: "") }
    var showDatePicker by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(stringResource(R.string.edit_vaccine_title), style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(4.dp))
            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text(stringResource(R.string.vaccine_name_label)) }, singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            Box {
                OutlinedTextField(
                    value = formatDueDate(dueDate),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.vaccine_due_date_label)) },
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    trailingIcon = { Icon(Icons.Outlined.CalendarMonth, stringResource(R.string.vaccine_pick_date)) },
                    modifier = Modifier.fillMaxWidth(),
                )
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .clickable { showDatePicker = true },
                )
            }
            OutlinedTextField(
                value = intervalMonths, onValueChange = { intervalMonths = it },
                label = { Text(stringResource(R.string.vaccine_interval_label)) }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                supportingText = { Text(stringResource(R.string.vaccine_interval_optional), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) },
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = notes, onValueChange = { notes = it },
                label = { Text(stringResource(R.string.vaccine_notes_label)) }, maxLines = 3,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) { Text(stringResource(R.string.action_cancel)) }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (name.isNotBlank() && dueDate.isNotBlank()) {
                            onSubmit(name, dueDate, intervalMonths.toIntOrNull(), notes.ifBlank { null })
                        }
                    },
                    enabled = name.isNotBlank() && dueDate.isNotBlank(),
                ) { Text(stringResource(R.string.action_save)) }
            }
            Spacer(Modifier.height(16.dp))
        }
    }

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                        fmt.timeZone = java.util.TimeZone.getTimeZone("UTC")
                        dueDate = fmt.format(java.util.Date(millis))
                    }
                    showDatePicker = false
                }) {
                    Text(stringResource(R.string.action_ok))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text(stringResource(R.string.action_cancel))
                }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddVaccineDialog(
    onDismiss: () -> Unit,
    onSubmit: (name: String, dueDate: String, intervalMonths: Int?, notes: String) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var dueDate by remember { mutableStateOf("") }
    var intervalMonths by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var showDatePicker by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(stringResource(R.string.add_vaccine_title), style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(4.dp))
            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text(stringResource(R.string.vaccine_name_label)) }, singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            Box {
                OutlinedTextField(
                    value = formatDueDate(dueDate),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.vaccine_due_date_label)) },
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    trailingIcon = { Icon(Icons.Outlined.CalendarMonth, stringResource(R.string.vaccine_pick_date)) },
                    modifier = Modifier.fillMaxWidth(),
                )
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .clickable { showDatePicker = true },
                )
            }
            OutlinedTextField(
                value = intervalMonths, onValueChange = { intervalMonths = it },
                label = { Text(stringResource(R.string.vaccine_interval_label)) }, singleLine = true,
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Number),
                supportingText = { Text(stringResource(R.string.vaccine_interval_hint), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) },
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = notes, onValueChange = { notes = it },
                label = { Text(stringResource(R.string.vaccine_notes_label)) }, maxLines = 3,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) { Text(stringResource(R.string.action_cancel)) }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (name.isNotBlank() && dueDate.isNotBlank()) {
                            onSubmit(name, dueDate, intervalMonths.toIntOrNull(), notes)
                        }
                    },
                    enabled = name.isNotBlank() && dueDate.isNotBlank(),
                ) { Text(stringResource(R.string.action_add)) }
            }
            Spacer(Modifier.height(16.dp))
        }
    }

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                        fmt.timeZone = java.util.TimeZone.getTimeZone("UTC")
                        dueDate = fmt.format(java.util.Date(millis))
                    }
                    showDatePicker = false
                }) {
                    Text(stringResource(R.string.action_ok))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text(stringResource(R.string.action_cancel))
                }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}
